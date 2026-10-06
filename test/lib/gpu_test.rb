require "test_helper"

class GpuTest < ActiveSupport::TestCase
  test "nobody listening becomes Gpu::Offline" do
    [ Errno::ECONNREFUSED, Errno::EHOSTUNREACH, SocketError, Net::OpenTimeout ].each do |error_class|
      assert_raises(Gpu::Offline) { Gpu.translating_network_errors { raise error_class } }
    end
  end

  test "a dropped connection becomes Gpu::ConnectionError" do
    [ Errno::ECONNRESET, EOFError ].each do |error_class|
      assert_raises(Gpu::ConnectionError) { Gpu.translating_network_errors { raise error_class } }
    end
  end

  test "a read timeout becomes Gpu::Timeout" do
    assert_raises(Gpu::Timeout) { Gpu.translating_network_errors { raise Net::ReadTimeout } }
  end

  test "keeps the original error as the cause" do
    error = assert_raises(Gpu::Offline) { Gpu.translating_network_errors { raise Errno::ECONNREFUSED, "10.0.0.1:8188" } }

    assert_kind_of Errno::ECONNREFUSED, error.cause
  end

  test "returns the block's value" do
    assert_equal 42, Gpu.translating_network_errors { 42 }
  end
end
