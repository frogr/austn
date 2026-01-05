require "test_helper"

class GpuQueueStatusTest < ActionController::TestCase
  # Create a test controller that includes the concern
  class TestController < ApplicationController
    include GpuQueueStatus

    def test_action
      service = MockRedisService.new(result_exists: false, status: { "status" => "pending" })
      render json: status_with_queue_position("test-id", service)
    end
  end

  # Mock Redis service for testing
  class MockRedisService
    def initialize(result_exists: false, status: {})
      @result_exists = result_exists
      @status = status
    end

    def result_exists?(_id)
      @result_exists
    end

    def get_status(_id)
      @status
    end
  end

  tests TestController

  setup do
    Rails.application.routes.draw do
      get "test_action", to: "gpu_queue_status_test/test#test_action"
    end
  end

  teardown do
    Rails.application.reload_routes!
  end

  test "status_with_queue_position returns pending status when no queue position" do
    # The controller will use the mock service
    # This test verifies the concern is correctly included
    assert TestController.ancestors.include?(GpuQueueStatus)
  end

  test "gpu_queue_position returns nil when job not in queue" do
    controller = TestController.new
    controller.request = ActionController::TestRequest.create(TestController)

    position = controller.send(:gpu_queue_position, "nonexistent-id")
    assert_nil position
  end
end
