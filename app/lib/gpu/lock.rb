module Gpu
  # One Redis mutex for the one GPU. The stored value is the holder's id, so
  # only the holder can release it, and release is a single compare-and-delete
  # script so it can never delete a lock someone else acquired after expiry.
  class Lock
    KEY = "gpu_lock".freeze

    RELEASE_SCRIPT = <<~LUA.freeze
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      end
      return 0
    LUA

    def initialize(redis:, key: KEY)
      @redis = redis
      @key = key
    end

    # @param ttl [ActiveSupport::Duration, Integer] must outlast the holder's work
    # @return [Boolean] whether the lock was acquired
    def acquire(holder, ttl:)
      @redis.set(@key, holder, nx: true, ex: ttl.to_i)
    end

    # @return [Boolean] whether this holder still held the lock
    def release(holder)
      @redis.eval(RELEASE_SCRIPT, keys: [ @key ], argv: [ holder ]) == 1
    end

    def holder
      @redis.get(@key)
    end
  end
end
