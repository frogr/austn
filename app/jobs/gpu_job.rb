# Base class for all GPU-intensive jobs
# Ensures proper queue assignment and resource management
class GpuJob < ApplicationJob
  # Always use the GPU queue for these jobs
  queue_as :gpu

  # Track which service this job is for (override in subclasses)
  class_attribute :gpu_service_name, default: nil

  # GPU lock timeout in seconds (override in subclasses for long-running jobs)
  class_attribute :gpu_lock_timeout, default: 300

  # Retry configuration for GPU jobs
  retry_on StandardError, wait: :exponentially_longer, attempts: 3 do |job, error|
    Rails.logger.error "GPU job #{job.class.name} failed after retries: #{error.message}"
    job.class.mark_service_offline(error.message) if job.class.gpu_service_name
  end

  # Ensure only one GPU job runs at a time by using Redis lock
  around_perform do |job, block|
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    lock_key = "gpu_lock"
    lock_timeout = job.class.gpu_lock_timeout

    # Try to acquire lock
    acquired = redis.set(lock_key, job.job_id, nx: true, ex: lock_timeout)

    if acquired
      begin
        Rails.logger.info "GPU job #{job.class.name} (#{job.job_id}) acquired GPU lock"
        block.call
      ensure
        # Only release if we still own the lock
        if redis.get(lock_key) == job.job_id
          redis.del(lock_key)
          Rails.logger.info "GPU job #{job.class.name} (#{job.job_id}) released GPU lock"
        end
      end
    else
      # Reschedule if couldn't acquire lock
      Rails.logger.info "GPU job #{job.class.name} (#{job.job_id}) waiting for GPU lock, rescheduling..."
      job.class.set(wait: 5.seconds).perform_later(*job.arguments)
    end
  end

  # Helper method to store results in Redis
  def store_result(key, value, ttl: 3600)
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    redis.setex(key, ttl, value.to_json)
  end

  # Helper method to get result from Redis
  def self.get_result(key)
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    result = redis.get(key)
    JSON.parse(result) if result
  rescue JSON::ParserError
    nil
  end

  # Mark the GPU service as online
  def self.mark_service_online
    return unless gpu_service_name
    GpuHealthStatus.for_service(gpu_service_name).mark_online!
  end

  # Mark the GPU service as offline with error
  def self.mark_service_offline(error_message = nil)
    return unless gpu_service_name
    GpuHealthStatus.for_service(gpu_service_name).mark_offline!(error_message)
  end

  # Instance method to mark online (called after successful job)
  def mark_service_online
    self.class.mark_service_online
  end

  protected

  # Standard status hashes for consistency
  def processing_status
    { status: "processing", started_at: Time.current }
  end

  def completed_status
    { status: "completed", completed_at: Time.current }
  end

  def failed_status(error_message)
    { status: "failed", error: error_message, failed_at: Time.current }
  end

  # ActionCable broadcasting helpers
  def broadcast_processing(generation_id, channel_prefix)
    ActionCable.server.broadcast(
      "#{channel_prefix}_#{generation_id}",
      { status: "processing", generation_id: generation_id }
    )
  end

  def broadcast_complete(generation_id, channel_prefix, extra = {})
    ActionCable.server.broadcast(
      "#{channel_prefix}_#{generation_id}",
      { status: "complete", generation_id: generation_id }.merge(extra)
    )
  end

  def broadcast_failure(generation_id, channel_prefix, error_message)
    ActionCable.server.broadcast(
      "#{channel_prefix}_#{generation_id}",
      { status: "failed", error: error_message }
    )
  end

  # Standard error handling
  def handle_failure(error, generation_id, service, channel_prefix)
    Rails.logger.error "#{self.class.name} #{generation_id} failed: #{error.message}"
    Rails.logger.error error.backtrace.join("\n")

    service.store_status(generation_id, failed_status(error.message), ttl: 600)
    broadcast_failure(generation_id, channel_prefix, error.message)
  end
end
