class MusicGenerationJob < GpuJob
  self.gpu_service_name = "music"
  self.gpu_lock_timeout = MusicService::MAX_COMPLETION_TIMEOUT.seconds + 5.minutes

  def perform(generation_id, params = {})
    start_generation

    result = MusicService.generate(params.symbolize_keys.slice(*MusicService::PARAMS).compact)

    # Only the ComfyUI output reference is stored; the audio is proxied on request.
    redis_service.store_music(generation_id, {
      filename: result[:filename],
      subfolder: result[:subfolder],
      type: result[:type],
      seed: result[:seed],
      tags: params["tags"],
      lyrics: params["lyrics"],
      params: params,
      created_at: Time.current
    })

    finish_generation
  end

  private

  def redis_service = MusicRedisService.new
  def channel_prefix = "music_generation"
end
