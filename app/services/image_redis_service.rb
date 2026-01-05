class ImageRedisService < BaseRedisService
  PUBLISHED_SET_KEY = "published_ai_images"
  PUBLISHED_SET_TTL = 3600 # 1 hour for the sorted set

  # Alias methods for domain-specific naming
  alias_method :store_image, :store_result
  alias_method :get_image, :get_result
  alias_method :image_exists?, :result_exists?
  alias_method :image_ttl, :result_ttl

  # Override to handle publishing
  def store_image(generation_id, image_data, publish: false, ttl: DEFAULT_TTL)
    store_result(generation_id, image_data, ttl: ttl)
    add_to_published(generation_id) if publish
  end

  # Override to also remove from published set
  def delete_image(generation_id)
    delete_result(generation_id)
    redis.zrem(PUBLISHED_SET_KEY, generation_id)
  end

  # Get all published AI images
  def get_published_images
    image_ids = redis.zrevrange(PUBLISHED_SET_KEY, 0, -1)

    image_ids.filter_map do |id|
      image_data = get_image(id)
      next unless image_data

      format_image_for_display(id, image_data)
    end
  end

  # Add image to published set
  def add_to_published(generation_id)
    redis.zadd(PUBLISHED_SET_KEY, Time.current.to_i, generation_id)
    redis.expire(PUBLISHED_SET_KEY, PUBLISHED_SET_TTL)
  end

  # Remove old published images
  def cleanup_published_images(older_than = 1.hour)
    cutoff_time = older_than.ago.to_i
    redis.zremrangebyscore(PUBLISHED_SET_KEY, 0, cutoff_time)
  end

  # Cleanup orphaned or expired keys
  def cleanup_expired_keys
    cleaned_count = 0

    redis.scan_each(match: "#{key_prefix}:*") do |key|
      ttl = redis.ttl(key)
      next if ttl == -2 # Key doesn't exist

      if ttl == -1 || ttl > DEFAULT_TTL
        redis.del(key)
        cleaned_count += 1
        Rails.logger.debug "Cleaned up Redis key: #{key} (TTL was: #{ttl})"
      end
    end

    cleaned_count
  end

  protected

  def key_prefix
    "image"
  end

  # Expose redis for publishing methods
  def redis
    @redis
  end

  private

  def format_image_for_display(id, image_data)
    base = {
      id: id,
      prompt: image_data["prompt"],
      created_at: image_data["created_at"]
    }

    if image_data["images"]
      base.merge(
        base64: image_data["images"].first,
        batch_size: image_data["batch_size"] || image_data["images"].length
      )
    elsif image_data["base64"]
      base.merge(base64: image_data["base64"])
    end
  end
end
