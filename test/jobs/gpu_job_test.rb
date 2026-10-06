require "test_helper"

class GpuJobTest < ActiveJob::TestCase
  # Records what a GPU job writes to its tool's Redis service.
  class MemoryRedisService
    attr_reader :statuses

    def initialize
      @statuses = {}
    end

    def store_status(generation_id, data, ttl: nil)
      @statuses[generation_id] = data.deep_stringify_keys
    end
  end

  class FakeToolJob < GpuJob
    self.gpu_service_name = "rembg"

    cattr_accessor :work, :lock_key, :memory_store, :attempts

    def perform(_generation_id)
      self.class.attempts += 1
      start_generation
      work.call
      finish_generation
    end

    private

    def redis_service = memory_store
    def channel_prefix = "fake_tool"
    def gpu_lock = Gpu::Lock.new(redis: redis, key: lock_key)
  end

  setup do
    FakeToolJob.lock_key = "test:gpu_lock:#{SecureRandom.hex(8)}"
    FakeToolJob.memory_store = MemoryRedisService.new
    FakeToolJob.attempts = 0
    FakeToolJob.work = -> { }
    @lock = Gpu::Lock.new(redis: GpuJob.redis, key: FakeToolJob.lock_key)
  end

  teardown do
    GpuJob.redis.del(FakeToolJob.lock_key)
  end

  test "runs while holding the GPU lock and releases it afterwards" do
    holder_during_work = nil
    FakeToolJob.work = -> { holder_during_work = @lock.holder }

    job = FakeToolJob.new("gen-1")
    job.perform_now

    assert_equal job.job_id, holder_during_work
    assert_nil @lock.holder
  end

  test "marks the generation completed and the tool online" do
    FakeToolJob.perform_now("gen-1")

    assert_equal "completed", FakeToolJob.memory_store.statuses["gen-1"]["status"]
    assert GpuHealthStatus.online?("rembg")
  end

  test "waits for the lock instead of running alongside another GPU job" do
    @lock.acquire("someone-else", ttl: 60)

    assert_enqueued_with(job: FakeToolJob, args: [ "gen-1" ]) do
      FakeToolJob.perform_now("gen-1")
    end
    assert_equal 0, FakeToolJob.attempts
    assert_equal "someone-else", @lock.holder
  end

  test "retries a dropped connection, then reports the failure" do
    FakeToolJob.work = -> { raise Gpu::ConnectionError, "Connection reset by peer" }

    FakeToolJob.perform_later("gen-1")
    2.times { perform_enqueued_jobs } # each attempt enqueues the next one
    assert_equal "processing", FakeToolJob.memory_store.statuses["gen-1"]["status"]

    assert_raises(Gpu::ConnectionError) { perform_enqueued_jobs }

    assert_equal 3, FakeToolJob.attempts
    assert_equal "gpu_offline", FakeToolJob.memory_store.statuses["gen-1"]["error_code"]
    assert_nil @lock.holder
  end

  test "does not retry when the backend is offline, and marks the tool offline" do
    GpuHealthStatus.for_service("rembg").mark_online!
    FakeToolJob.work = -> { raise Gpu::Offline, "Failed to open TCP connection to 10.0.0.1:8188" }

    perform_enqueued_jobs { FakeToolJob.perform_later("gen-1") }

    assert_equal 1, FakeToolJob.attempts
    assert_not GpuHealthStatus.online?("rembg")
    status = FakeToolJob.memory_store.statuses["gen-1"]
    assert_equal "failed", status["status"]
    assert_equal "gpu_offline", status["error_code"]
    assert_not_includes status.to_json, "10.0.0.1"
  end

  test "reports unexpected errors without their details and lets them reach Sidekiq" do
    FakeToolJob.work = -> { raise ArgumentError, "secret internal detail" }

    assert_raises(ArgumentError) { FakeToolJob.perform_now("gen-1") }

    status = FakeToolJob.memory_store.statuses["gen-1"]
    assert_equal "generation_failed", status["error_code"]
    assert_not_includes status.to_json, "secret internal detail"
    assert_nil @lock.holder
  end

  test "a timeout is reported as such and not retried" do
    FakeToolJob.work = -> { raise Gpu::Timeout, "did not finish within 30s" }

    assert_no_enqueued_jobs do
      assert_raises(Gpu::Timeout) { FakeToolJob.perform_now("gen-1") }
    end

    assert_equal 1, FakeToolJob.attempts
    assert_equal "timeout", FakeToolJob.memory_store.statuses["gen-1"]["error_code"]
  end

  test "every GPU tool job can record a successful run" do
    Rails.application.eager_load!

    GpuJob.descendants.filter_map(&:gpu_service_name).uniq.each do |service|
      next unless GpuHealthStatus::SERVICES.include?(service) # test-only subclasses

      job_class = GpuJob.descendants.find { |job| job.gpu_service_name == service }
      job_class.mark_service_online

      assert GpuHealthStatus.online?(service), "#{job_class.name} could not mark #{service} online"
    end
  end

  test "lock lifetimes outlast the longest runs" do
    # Stems waits up to COMPLETION_TIMEOUT for ComfyUI, then downloads four stems (up to 120s each).
    assert_operator StemsJob.gpu_lock_timeout, :>, (StemSeparationService::COMPLETION_TIMEOUT + 4 * 120).seconds
    assert_operator MusicGenerationJob.gpu_lock_timeout, :>, MusicService::MAX_COMPLETION_TIMEOUT.seconds
    assert_operator Model3dJob.gpu_lock_timeout, :>, (Model3dService::GENERATION_TIMEOUT + 120).seconds
    assert_operator TtsGenerationJob.gpu_lock_timeout, :>, 240.seconds
  end
end
