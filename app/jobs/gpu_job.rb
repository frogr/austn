# Base class for all GPU-intensive jobs
# Ensures proper queue assignment and resource management
class GpuJob < ApplicationJob
  # Always use the GPU queue for these jobs
  queue_as :gpu

  # Retry configuration for GPU jobs
  retry_on StandardError, wait: :exponentially_longer, attempts: 3 do |job, error|
    Rails.logger.error "GPU job #{job.class.name} failed after retries: #{error.message}"
  end

  # Ensure only one GPU job runs at a time by using Redis lock
  around_perform do |job, block|
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    lock_key = "gpu_lock"
    lock_timeout = 300 # 5 minutes

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
end
