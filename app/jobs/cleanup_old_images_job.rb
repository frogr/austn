class CleanupOldImagesJob < ApplicationJob
  queue_as :low

  def perform
    service = ImageRedisService.new

    # Clean up expired keys
    cleaned_count = service.cleanup_expired_keys

    # Clean up old published images (older than 1 hour)
    service.cleanup_published_images(1.hour)

    Rails.logger.info "Cleaned up #{cleaned_count} old temporary images" if cleaned_count > 0
  end
end
