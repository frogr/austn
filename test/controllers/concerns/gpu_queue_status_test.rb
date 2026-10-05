require "test_helper"

class GpuQueueStatusTest < ActiveSupport::TestCase
  class StatusReader
    include GpuQueueStatus

    public :status_with_queue_position, :gpu_queue_position
  end

  class PendingRedisService
    def get_status(_generation_id) = { "status" => "pending" }
  end

  setup do
    @generation_id = "gen-#{SecureRandom.hex(8)}"
    @reader = StatusReader.new
  end

  teardown do
    Sidekiq::Queue.new(GpuJob.queue_name).each { |job| job.delete if job.display_args.first == @generation_id }
  end

  test "finds a queued Active Job by its generation id" do
    enqueue_in_sidekiq(RembgJob, @generation_id)

    assert_not_nil @reader.gpu_queue_position(@generation_id)
  end

  test "reports the queue position of a pending generation" do
    enqueue_in_sidekiq(RembgJob, @generation_id)

    status = @reader.status_with_queue_position(@generation_id, PendingRedisService.new)

    assert_equal "queued", status["status"]
    assert_operator status["position"], :>=, 1
  end

  test "returns nil for a generation that isn't queued" do
    assert_nil @reader.gpu_queue_position(@generation_id)
  end

  private

  # Pushes the job the way the Sidekiq Active Job adapter does in production.
  def enqueue_in_sidekiq(job_class, *arguments)
    job = job_class.new(*arguments)
    Sidekiq::Client.push(
      "class" => Sidekiq::ActiveJob::Wrapper,
      "wrapped" => job_class.name,
      "queue" => job.queue_name,
      "args" => [ job.serialize ]
    )
  end
end
