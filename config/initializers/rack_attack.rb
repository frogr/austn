# frozen_string_literal: true

# Rate limiting configuration for API endpoints
# Uses Rack::Attack gem for request throttling

class Rack::Attack
  # Use Redis for tracking (shares with Rails.cache)
  Rack::Attack.cache.store = ActiveSupport::Cache::RedisCacheStore.new(
    url: ENV.fetch("REDIS_URL", "redis://localhost:6379/1")
  )

  ### Throttle TTS API requests by API key ###
  # Limit: 100 requests per hour per API key
  throttle("tts_api/ip", limit: 100, period: 1.hour) do |req|
    if req.path.start_with?("/api/v1/tts")
      # Use API key for tracking, fall back to IP
      req.env["HTTP_X_API_KEY"] || req.ip
    end
  end

  ### Throttle synthesize endpoint more strictly ###
  # This is the expensive endpoint that actually generates audio
  # Limit: 60 requests per hour (1 per minute average)
  throttle("tts_api/synthesize", limit: 60, period: 1.hour) do |req|
    if req.path == "/api/v1/tts/synthesize" && req.post?
      req.env["HTTP_X_API_KEY"] || req.ip
    end
  end

  ### Short-term burst protection ###
  # Prevent rapid-fire requests: max 5 requests per 10 seconds
  throttle("tts_api/burst", limit: 5, period: 10.seconds) do |req|
    if req.path.start_with?("/api/v1/tts") && req.post?
      req.env["HTTP_X_API_KEY"] || req.ip
    end
  end

  ### Block bad actors who've been throttled too often ###
  # If someone hits rate limits 10 times, block them for 1 hour
  blocklist("tts_api/block_repeat_offenders") do |req|
    if req.path.start_with?("/api/v1/tts")
      # Track failed attempts
      key = "tts_rate_limit_violations:#{req.env['HTTP_X_API_KEY'] || req.ip}"
      Rack::Attack::Allow2Ban.filter(key, maxretry: 10, findtime: 1.hour, bantime: 1.hour) do
        # Track when they hit a rate limit
        req.env["rack.attack.matched"]
      end
    end
  end

  ### Throttle booking creation ###
  # Limit: 5 bookings per hour per IP
  throttle("bookings/create", limit: 5, period: 1.hour) do |req|
    if req.path == "/bookings" && req.post?
      req.ip
    end
  end

  # Burst protection: max 2 bookings per minute per IP
  throttle("bookings/burst", limit: 2, period: 1.minute) do |req|
    if req.path == "/bookings" && req.post?
      req.ip
    end
  end

  ### Custom throttle response ###
  self.throttled_responder = lambda do |request|
    match_data = request.env["rack.attack.match_data"]
    now = match_data[:epoch_time]
    retry_after = match_data[:period] - (now % match_data[:period])

    [
      429,
      {
        "Content-Type" => "application/json",
        "Retry-After" => retry_after.to_s,
        "X-RateLimit-Limit" => match_data[:limit].to_s,
        "X-RateLimit-Remaining" => "0",
        "X-RateLimit-Reset" => (now + retry_after).to_s
      },
      [ { error: "Rate limit exceeded. Try again in #{retry_after} seconds." }.to_json ]
    ]
  end

  ### Logging for debugging ###
  ActiveSupport::Notifications.subscribe("throttle.rack_attack") do |_name, _start, _finish, _id, payload|
    req = payload[:request]
    Rails.logger.warn "[Rack::Attack] Throttled #{req.env['HTTP_X_API_KEY'] || req.ip} on #{req.path}"
  end

  ActiveSupport::Notifications.subscribe("blocklist.rack_attack") do |_name, _start, _finish, _id, payload|
    req = payload[:request]
    Rails.logger.warn "[Rack::Attack] Blocked #{req.env['HTTP_X_API_KEY'] || req.ip} on #{req.path}"
  end
end
