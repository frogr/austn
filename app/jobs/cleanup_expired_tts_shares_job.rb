class CleanupExpiredTtsSharesJob < ApplicationJob
  queue_as :low

  def perform
    deleted_count = TtsShare.cleanup_expired!
    Rails.logger.info "Cleaned up #{deleted_count} expired TTS shares" if deleted_count > 0
  end
end
