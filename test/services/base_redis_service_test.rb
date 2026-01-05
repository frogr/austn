require "test_helper"

class BaseRedisServiceTest < ActiveSupport::TestCase
  class TestRedisService < BaseRedisService
    def key_prefix
      "test"
    end
  end

  setup do
    @service = TestRedisService.new
    @generation_id = SecureRandom.uuid
  end

  teardown do
    @service.delete_result(@generation_id)
  end

  test "stores and retrieves result" do
    data = { "foo" => "bar", "count" => 42 }
    @service.store_result(@generation_id, data)

    result = @service.get_result(@generation_id)
    assert_equal "bar", result["foo"]
    assert_equal 42, result["count"]
  end

  test "stores and retrieves status" do
    status = { "status" => "processing", "started_at" => Time.current.to_s }
    @service.store_status(@generation_id, status)

    result = @service.get_status(@generation_id)
    assert_equal "processing", result["status"]
  end

  test "returns pending status when no status exists" do
    result = @service.get_status("nonexistent_id")
    assert_equal "pending", result["status"]
  end

  test "result_exists? returns true when result exists" do
    @service.store_result(@generation_id, { "data" => "test" })
    assert @service.result_exists?(@generation_id)
  end

  test "result_exists? returns false when result does not exist" do
    refute @service.result_exists?("nonexistent_id")
  end

  test "delete_result removes both result and status" do
    @service.store_result(@generation_id, { "data" => "test" })
    @service.store_status(@generation_id, { "status" => "complete" })

    @service.delete_result(@generation_id)

    refute @service.result_exists?(@generation_id)
    assert_equal "pending", @service.get_status(@generation_id)["status"]
  end

  test "respects custom TTL" do
    @service.store_result(@generation_id, { "data" => "test" }, ttl: 1)

    # Result should exist immediately
    assert @service.result_exists?(@generation_id)

    # Wait for TTL to expire
    sleep 2

    # Result should be gone
    refute @service.result_exists?(@generation_id)
  end
end
