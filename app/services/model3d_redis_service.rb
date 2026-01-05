class Model3dRedisService < BaseRedisService
  # 24-hour TTL for 3D models to match database expiration
  DEFAULT_TTL = 86400 # 24 hours

  # Store GLB data separately with longer TTL
  def store_glb(generation_id, glb_data, ttl: DEFAULT_TTL)
    @redis.setex(glb_key(generation_id), ttl, Base64.strict_encode64(glb_data))
  end

  # Get GLB data
  def get_glb(generation_id)
    data = @redis.get(glb_key(generation_id))
    return nil unless data
    Base64.strict_decode64(data)
  end

  # Check if GLB exists
  def glb_exists?(generation_id)
    @redis.exists?(glb_key(generation_id))
  end

  # Delete all keys for a generation (result, status, and GLB)
  def delete_all(generation_id)
    delete_result(generation_id)
    @redis.del(glb_key(generation_id))
  end

  protected

  def key_prefix
    "model3d"
  end

  private

  def glb_key(generation_id)
    "#{key_prefix}:#{generation_id}:glb"
  end
end
