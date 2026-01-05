class CleanupOldModel3dsJob < ApplicationJob
  queue_as :low

  def perform
    # Clean up expired 3D models from the database
    expired_count = ThreeDModel.expired.count

    if expired_count > 0
      # Get generation IDs before deleting so we can clean up Redis too
      expired_generation_ids = ThreeDModel.expired.pluck(:generation_id)

      # Delete from database
      ThreeDModel.cleanup_expired!

      # Clean up Redis keys for expired models (in case TTL hasn't caught them yet)
      redis_service = Model3dRedisService.new
      expired_generation_ids.each do |generation_id|
        redis_service.delete_all(generation_id)
      end

      Rails.logger.info "Cleaned up #{expired_count} expired 3D models"
    end
  end
end
