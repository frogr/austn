class CleanupOldImagesJob < ApplicationJob
  queue_as :low

  def perform
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    cleaned_count = 0

    # Clean Redis keys older than 1 hour or with negative TTL
    redis.scan_each(match: "image:*") do |key|
      ttl = redis.ttl(key)

      # Delete if TTL is negative (no expiry set) or greater than 1 hour
      # (which shouldn't happen with our 10 min TTL, but good for cleanup)
      if ttl < 0 || ttl > 3600
        redis.del(key)
        cleaned_count += 1
      end
    end

    Rails.logger.info "Cleaned up #{cleaned_count} old temporary images" if cleaned_count > 0
  end
end