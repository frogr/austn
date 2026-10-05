require "test_helper"

class TtsBatchJobTest < ActiveJob::TestCase
  setup do
    @batch = TtsBatch.create!(name: "test batch", total_items: 2)
    @first = @batch.tts_batch_items.create!(text: "one", position: 1)
    @second = @batch.tts_batch_items.create!(text: "two", position: 2)
  end

  test "an offline TTS server stops the batch instead of failing every item" do
    GpuHealthStatus.for_service("tts").mark_online!

    TtsService.stub(:generate_speech, ->(*, **) { raise Gpu::Offline, "TTS_URL is not set" }) do
      TtsBatchJob.perform_now(@batch.id)
    end

    assert_equal 0, @batch.reload.failed_items
    assert_equal "pending", @second.reload.status
    assert_no_enqueued_jobs only: TtsBatchJob
    assert_not GpuHealthStatus.online?("tts")
  end

  test "an ordinary error fails only that item and moves on" do
    TtsService.stub(:generate_speech, ->(*, **) { raise ArgumentError, "bad text" }) do
      TtsBatchJob.perform_now(@batch.id)
    end

    assert_equal "failed", @first.reload.status
    assert_equal 1, @batch.reload.failed_items
    assert_enqueued_jobs 1, only: TtsBatchJob
  end
end
