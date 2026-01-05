class StemsRedisService
  DEFAULT_TTL = 600 # 10 minutes

  def initialize
    @redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
  end

  # Store stems result
  def store_result(generation_id, data, options = {})
    ttl = options[:ttl] || DEFAULT_TTL
    key = result_key(generation_id)

    @redis.setex(key, ttl, data.to_json)
  end

  # Store stems status
  def store_status(generation_id, status_data, options = {})
    ttl = options[:ttl] || DEFAULT_TTL
    key = status_key(generation_id)

    @redis.setex(key, ttl, status_data.to_json)
  end

  # Get result data
  def get_result(generation_id)
    data = @redis.get(result_key(generation_id))
    data ? JSON.parse(data) : nil
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse stems data for #{generation_id}: #{e.message}"
    nil
  end

  # Get status
  def get_status(generation_id)
    data = @redis.get(status_key(generation_id))
    data ? JSON.parse(data) : { "status" => "pending" }
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse stems status for #{generation_id}: #{e.message}"
    { "status" => "error", "error" => "Invalid status data" }
  end

  # Check if result exists
  def result_exists?(generation_id)
    @redis.exists?(result_key(generation_id))
  end

  # Delete result and status
  def delete_result(generation_id)
    @redis.del(result_key(generation_id), status_key(generation_id))
  end

  private

  def result_key(generation_id)
    "stems:#{generation_id}"
  end

  def status_key(generation_id)
    "stems:#{generation_id}:status"
  end
end
