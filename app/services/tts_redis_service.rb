class TtsRedisService
  DEFAULT_TTL = 600 # 10 minutes

  def initialize
    @redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
  end

  # Store generated audio
  def store_audio(generation_id, audio_data, options = {})
    ttl = options[:ttl] || DEFAULT_TTL
    key = audio_key(generation_id)

    @redis.setex(key, ttl, audio_data.to_json)
  end

  # Store generation status
  def store_status(generation_id, status_data, options = {})
    ttl = options[:ttl] || DEFAULT_TTL
    key = status_key(generation_id)

    @redis.setex(key, ttl, status_data.to_json)
  end

  # Get audio data
  def get_audio(generation_id)
    data = @redis.get(audio_key(generation_id))
    data ? JSON.parse(data) : nil
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse audio data for #{generation_id}: #{e.message}"
    nil
  end

  # Get generation status
  def get_status(generation_id)
    data = @redis.get(status_key(generation_id))
    data ? JSON.parse(data) : { status: "pending" }
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse status for #{generation_id}: #{e.message}"
    { status: "error", error: "Invalid status data" }
  end

  # Check if audio exists
  def audio_exists?(generation_id)
    @redis.exists?(audio_key(generation_id))
  end

  # Get TTL for audio
  def audio_ttl(generation_id)
    @redis.ttl(audio_key(generation_id))
  end

  # Delete audio and its status
  def delete_audio(generation_id)
    @redis.del(audio_key(generation_id), status_key(generation_id))
  end

  private

  def audio_key(generation_id)
    "tts:#{generation_id}"
  end

  def status_key(generation_id)
    "tts:#{generation_id}:status"
  end
end
