class RembgRedisService < BaseRedisService
  protected

  def key_prefix
    "rembg"
  end
end
