class VtracerRedisService < BaseRedisService
  protected

  def key_prefix
    "vtracer"
  end
end
