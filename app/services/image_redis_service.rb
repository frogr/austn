class ImageRedisService
  DEFAULT_TTL = 600 # 10 minutes
  PUBLISHED_SET_KEY = "published_ai_images"
  PUBLISHED_SET_TTL = 3600 # 1 hour for the sorted set

  def initialize
    @redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
  end

  # Store an AI-generated image
  def store_image(generation_id, image_data, options = {})
    ttl = options[:ttl] || DEFAULT_TTL
    key = image_key(generation_id)

    @redis.setex(key, ttl, image_data.to_json)

    # Add to published set if requested
    if options[:publish]
      add_to_published(generation_id)
    end
  end

  # Store image generation status
  def store_status(generation_id, status_data, options = {})
    ttl = options[:ttl] || DEFAULT_TTL
    key = status_key(generation_id)

    @redis.setex(key, ttl, status_data.to_json)
  end

  # Get image data
  def get_image(generation_id)
    data = @redis.get(image_key(generation_id))
    data ? JSON.parse(data) : nil
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse image data for #{generation_id}: #{e.message}"
    nil
  end

  # Get image status
  def get_status(generation_id)
    data = @redis.get(status_key(generation_id))
    data ? JSON.parse(data) : { status: "pending" }
  rescue JSON::ParserError => e
    Rails.logger.error "Failed to parse status for #{generation_id}: #{e.message}"
    { status: "error", error: "Invalid status data" }
  end

  # Get all published AI images
  def get_published_images
    image_ids = @redis.zrevrange(PUBLISHED_SET_KEY, 0, -1)
    images = []

    image_ids.each do |id|
      image_data = get_image(id)
      next unless image_data

      # Format for display
      if image_data["images"]
        # Batch images - show first as thumbnail
        images << {
          id: id,
          prompt: image_data["prompt"],
          created_at: image_data["created_at"],
          base64: image_data["images"].first,
          batch_size: image_data["batch_size"] || image_data["images"].length
        }
      elsif image_data["base64"]
        # Single image
        images << {
          id: id,
          prompt: image_data["prompt"],
          created_at: image_data["created_at"],
          base64: image_data["base64"]
        }
      end
    end

    images
  end

  # Add image to published set
  def add_to_published(generation_id)
    # Add with current timestamp as score
    @redis.zadd(PUBLISHED_SET_KEY, Time.current.to_i, generation_id)
    # Refresh TTL on the sorted set
    @redis.expire(PUBLISHED_SET_KEY, PUBLISHED_SET_TTL)
  end

  # Remove old published images
  def cleanup_published_images(older_than = 1.hour)
    cutoff_time = older_than.ago.to_i
    @redis.zremrangebyscore(PUBLISHED_SET_KEY, 0, cutoff_time)
  end

  # Check if image exists
  def image_exists?(generation_id)
    @redis.exists?(image_key(generation_id))
  end

  # Get TTL for an image
  def image_ttl(generation_id)
    @redis.ttl(image_key(generation_id))
  end

  # Delete an image and its status
  def delete_image(generation_id)
    @redis.del(image_key(generation_id), status_key(generation_id))
    @redis.zrem(PUBLISHED_SET_KEY, generation_id)
  end

  # Cleanup orphaned or expired keys
  def cleanup_expired_keys
    cleaned_count = 0

    @redis.scan_each(match: "image:*") do |key|
      ttl = @redis.ttl(key)

      # Delete keys without TTL or with excessive TTL
      should_delete = case ttl
      when -2 then false # Key doesn't exist
      when -1 then true  # No expiry set
      else ttl > DEFAULT_TTL # Excessive TTL
      end

      if should_delete
        @redis.del(key)
        cleaned_count += 1
        Rails.logger.debug "Cleaned up Redis key: #{key} (TTL was: #{ttl})"
      end
    end

    cleaned_count
  end

  private

  def image_key(generation_id)
    "image:#{generation_id}"
  end

  def status_key(generation_id)
    "image:#{generation_id}:status"
  end
end
