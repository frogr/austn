class Model3dRedisService < BaseRedisService
  # GLB files are kept for a day so a preview link keeps working.
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

  protected

  def key_prefix
    "model3d"
  end

  private

  def glb_key(generation_id)
    "#{key_prefix}:#{generation_id}:glb"
  end
end
