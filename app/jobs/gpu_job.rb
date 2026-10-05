# Base class for work that runs on the home GPU box.
#
# - Jobs run on the `gpu` queue and hold Gpu::Lock while performing, so only
#   one GPU job runs at a time across every Sidekiq process. A job that finds
#   the lock taken re-enqueues itself a few seconds later.
# - A dropped connection is retried with backoff. An offline backend is not:
#   the job is discarded and the tool marked offline.
# - Whenever a job gives up, `record_failure` stores a visitor-safe error
#   (Gpu::PublicError) where the tool's status endpoint reads it. The full
#   exception only goes to the logs.
#
# Subclasses whose first argument is a generation id implement `redis_service`
# and `channel_prefix`, and call `start_generation` / `finish_generation`.
#
# Uploaded inputs arrive as Active Storage blobs (see GpuUpload). They are
# purged when the job succeeds or gives up, but kept across retries.
class GpuJob < ApplicationJob
  queue_as :gpu

  # Retries are handled by Active Job below. Anything unexpected goes
  # straight to Sidekiq's Dead set instead of re-running GPU work.
  sidekiq_options retry: 0

  LOCK_RETRY_DELAY = 5.seconds
  FAILED_STATUS_TTL = 10.minutes

  class_attribute :gpu_service_name

  # How long the GPU lock lives. It must outlast the job's longest run,
  # otherwise a second job can take the GPU while this one is still working.
  class_attribute :gpu_lock_timeout, default: 10.minutes

  retry_on Gpu::ConnectionError, wait: :polynomially_longer, attempts: 3

  discard_on Gpu::Offline do |job, error|
    job.class.mark_service_offline(error.message)
  end

  after_discard do |job, error|
    job.report_failure(error)
    job.purge_uploads
  end

  around_perform :with_gpu_lock

  # Shared Redis connection, so jobs don't open one per call.
  def self.redis
    @redis ||= Redis.new(url: Rails.application.config_for(:redis)["url"])
  end

  def self.mark_service_online
    GpuHealthStatus.for_service(gpu_service_name).mark_online! if gpu_service_name
  end

  def self.mark_service_offline(error_message = nil)
    GpuHealthStatus.for_service(gpu_service_name).mark_offline!(error_message) if gpu_service_name
  end

  def redis
    self.class.redis
  end

  def report_failure(error)
    Rails.logger.error "#{self.class.name} #{job_id} failed: #{error.class}: #{error.message}"
    record_failure(Gpu::PublicError.for(error))
  end

  def purge_uploads
    arguments.grep(ActiveStorage::Blob).each(&:purge)
  end

  private

  def with_gpu_lock
    lock = gpu_lock

    if lock.acquire(job_id, ttl: gpu_lock_timeout)
      begin
        yield
      ensure
        lock.release(job_id)
      end
    else
      Rails.logger.info "#{self.class.name} #{job_id} is waiting for the GPU lock"
      self.class.set(wait: LOCK_RETRY_DELAY).perform_later(*arguments)
    end
  end

  def gpu_lock
    Gpu::Lock.new(redis: redis)
  end

  def generation_id
    arguments.first
  end

  def start_generation
    redis_service.store_status(generation_id, { status: "processing", started_at: Time.current })
    broadcast(status: "processing", generation_id: generation_id)
  end

  def finish_generation(**details)
    redis_service.store_status(generation_id, { status: "completed", completed_at: Time.current, **details })
    broadcast(status: "complete", generation_id: generation_id, **details)
    self.class.mark_service_online
  end

  def record_failure(public_error)
    redis_service.store_status(
      generation_id,
      { status: "failed", failed_at: Time.current, **public_error.to_h },
      ttl: FAILED_STATUS_TTL.to_i
    )
    broadcast(status: "failed", generation_id: generation_id, **public_error.to_h)
  end

  def broadcast(payload)
    ActionCable.server.broadcast("#{channel_prefix}_#{generation_id}", payload)
  end
end
