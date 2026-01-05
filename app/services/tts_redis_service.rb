class TtsRedisService < BaseRedisService
  # Alias methods for domain-specific naming
  alias_method :store_audio, :store_result
  alias_method :get_audio, :get_result
  alias_method :audio_exists?, :result_exists?
  alias_method :audio_ttl, :result_ttl
  alias_method :delete_audio, :delete_result

  protected

  def key_prefix
    "tts"
  end
end
