require "test_helper"

class GpuJobTest < ActiveSupport::TestCase
  # Create a concrete subclass for testing
  class TestGpuJob < GpuJob
    self.gpu_service_name = "test"

    def perform(generation_id)
      # Test implementation
    end
  end

  setup do
    @job = TestGpuJob.new
    @job.instance_variable_set(:@generation_id, "test-123")
  end

  test "processing_status returns correct structure" do
    status = @job.send(:processing_status)

    assert_equal "processing", status[:status]
    assert status[:started_at].present?
  end

  test "completed_status returns correct structure" do
    status = @job.send(:completed_status)

    assert_equal "completed", status[:status]
    assert status[:completed_at].present?
  end

  test "failed_status includes error message" do
    status = @job.send(:failed_status, "Something went wrong")

    assert_equal "failed", status[:status]
    assert_equal "Something went wrong", status[:error]
    assert status[:failed_at].present?
  end

  test "gpu_service_name is set correctly" do
    assert_equal "test", TestGpuJob.gpu_service_name
  end
end
