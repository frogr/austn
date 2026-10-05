require "test_helper"

class Gpu::LockTest < ActiveSupport::TestCase
  setup do
    @redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    @key = "test:gpu_lock:#{SecureRandom.hex(8)}"
    @lock = Gpu::Lock.new(redis: @redis, key: @key)
  end

  teardown do
    @redis.del(@key)
    @redis.close
  end

  test "only one holder can acquire it" do
    assert @lock.acquire("job-1", ttl: 60)
    assert_not @lock.acquire("job-2", ttl: 60)
    assert_equal "job-1", @lock.holder
  end

  test "expires after its ttl" do
    @lock.acquire("job-1", ttl: 25.minutes)

    assert_in_delta 25.minutes.to_i, @redis.ttl(@key), 2
  end

  test "the holder can release it" do
    @lock.acquire("job-1", ttl: 60)

    assert @lock.release("job-1")
    assert_nil @lock.holder
    assert @lock.acquire("job-2", ttl: 60)
  end

  test "releasing a lock someone else now holds leaves it alone" do
    @lock.acquire("job-1", ttl: 60)
    @redis.del(@key) # job-1's lock expired...
    @lock.acquire("job-2", ttl: 60) # ...and job-2 took the GPU

    assert_not @lock.release("job-1")
    assert_equal "job-2", @lock.holder
  end
end
