class StemsJob < GpuJob
  self.gpu_service_name = "stems"
  # ComfyUI gets up to 15 minutes, then four stems are downloaded.
  self.gpu_lock_timeout = 30.minutes

  def perform(generation_id, upload, options = {})
    start_generation

    model = options["model"] || StemSeparationService::DEFAULT_MODEL
    stems = upload.open { |file| StemSeparationService.separate_stems(file.path, model: model) }
    redis_service.store_result(generation_id, {
      stems: stems, original_filename: upload.filename.to_s, model: model, created_at: Time.current
    })

    finish_generation
    purge_uploads
  end

  private

  def redis_service = StemsRedisService.new
  def channel_prefix = "stems"
end
