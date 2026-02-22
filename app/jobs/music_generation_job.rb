class MusicGenerationJob < GpuJob
  self.gpu_service_name = "music"
  sidekiq_options retry: 1

  def perform(generation_id, params = {})
    Rails.logger.info "Starting MusicGenerationJob #{generation_id}"
    service = MusicRedisService.new

    broadcast_processing(generation_id, "music_generation")
    service.store_status(generation_id, processing_status)

    result = MusicService.generate(
      tags: params["tags"],
      lyrics: params["lyrics"],
      audio_duration: params["audio_duration"],
      infer_step: params["infer_step"],
      guidance_scale: params["guidance_scale"],
      guidance_scale_text: params["guidance_scale_text"],
      guidance_scale_lyric: params["guidance_scale_lyric"],
      seed: params["seed"],
      scheduler: params["scheduler"],
      preset: params["preset"]
    )

    # Store ComfyUI output reference (not the audio itself)
    music_data = {
      filename: result[:filename],
      subfolder: result[:subfolder],
      type: result[:type],
      seed: result[:seed],
      tags: params["tags"],
      lyrics: params["lyrics"],
      params: params,
      created_at: Time.current
    }

    service.store_music(generation_id, music_data)
    service.store_status(generation_id, completed_status)
    broadcast_complete(generation_id, "music_generation")

    Rails.logger.info "MusicGenerationJob #{generation_id} completed successfully"
    mark_service_online
  rescue => e
    handle_failure(e, generation_id, service, "music_generation")
    raise
  end
end
