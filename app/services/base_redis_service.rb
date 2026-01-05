# Base class for Redis-backed result caching services.
# Subclasses need only define `key_prefix` to get full functionality.
#
# Example:
#   class TtsRedisService < BaseRedisService
#     def key_prefix = "tts"
#   end
#
class BaseRedisService
  DEFAULT_TTL = 600 # 10 minutes

  def initialize(redis: nil)
    @redis = redis || Redis.new(
      url: redis_url,
      timeout: 30,           # General timeout
      connect_timeout: 5,    # Connection timeout
      read_timeout: 60,      # Read timeout for large data
      write_timeout: 60      # Write timeout for large data (stems ~48MB)
    )
  end

  # Store a result
  def store_result(generation_id, data, ttl: DEFAULT_TTL)
    @redis.setex(result_key(generation_id), ttl, data.to_json)
  end

  # Store generation status
  def store_status(generation_id, status_data, ttl: DEFAULT_TTL)
    @redis.setex(status_key(generation_id), ttl, status_data.to_json)
  end

  # Get result data
  def get_result(generation_id)
    parse_json(@redis.get(result_key(generation_id)))
  end

  # Get status
  def get_status(generation_id)
    parse_json(@redis.get(status_key(generation_id))) || { "status" => "pending" }
  end

  # Check if result exists
  def result_exists?(generation_id)
    @redis.exists?(result_key(generation_id))
  end

  # Get TTL for a result
  def result_ttl(generation_id)
    @redis.ttl(result_key(generation_id))
  end

  # Delete result and status
  def delete_result(generation_id)
    @redis.del(result_key(generation_id), status_key(generation_id))
  end

  protected

  # Subclasses must implement this
  def key_prefix
    raise NotImplementedError, "Subclasses must define key_prefix"
  end

  private

  def redis_url
    Rails.application.config_for(:redis)["url"]
  end

  def result_key(generation_id)
    "#{key_prefix}:#{generation_id}"
  end

  def status_key(generation_id)
    "#{key_prefix}:#{generation_id}:status"
  end

  def parse_json(data)
    return nil unless data
    JSON.parse(data)
  rescue JSON::ParserError => e
    Rails.logger.error "#{self.class.name}: Failed to parse JSON: #{e.message}"
    nil
  end
end
