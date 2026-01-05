class StemsRedisService < BaseRedisService
  protected

  def key_prefix
    "stems"
  end
end
