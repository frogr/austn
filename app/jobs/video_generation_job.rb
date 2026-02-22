class VideoGenerationJob < GpuJob
  self.gpu_service_name = "video"
  self.gpu_lock_timeout = 660 # 11 minutes (video gen can take up to 10 min)
  sidekiq_options retry: 1

  def perform(generation_id, params = {})
    Rails.logger.info "Starting VideoGenerationJob #{generation_id}"
    service = VideoRedisService.new

    broadcast_processing(generation_id, "video_generation")
    service.store_status(generation_id, processing_status)

    result = VideoService.generate(
      prompt: params["prompt"],
      negative_prompt: params["negative_prompt"],
      width: params["width"],
      height: params["height"],
      length: params["length"],
      fps: params["fps"],
      steps: params["steps"],
      sampler_name: params["sampler_name"],
      scheduler: params["scheduler"],
      denoise: params["denoise"],
      seed: params["seed"],
      shift: params["shift"],
      preset: params["preset"]
    )

    # Store ComfyUI output reference (not the video itself)
    video_data = {
      filename: result[:filename],
      subfolder: result[:subfolder],
      type: result[:type],
      seed: result[:seed],
      prompt: params["prompt"],
      params: params,
      created_at: Time.current
    }

    service.store_video(generation_id, video_data)
    service.store_status(generation_id, completed_status)
    broadcast_complete(generation_id, "video_generation")

    Rails.logger.info "VideoGenerationJob #{generation_id} completed successfully"
    mark_service_online
  rescue => e
    handle_failure(e, generation_id, service, "video_generation")
    raise
  end
end
