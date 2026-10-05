class StemsJob < GpuJob
  self.gpu_service_name = "stems"
  # ComfyUI gets up to 15 minutes, then four stems are downloaded.
  self.gpu_lock_timeout = 30.minutes

  def perform(generation_id, file_data, options = {})
    start_generation

    original_filename = options["original_filename"] || "audio.mp3"
    model = options["model"] || StemSeparationService::DEFAULT_MODEL
    uploaded_file = UploadedFileProxy.from_base64(file_data["base64"], original_filename: original_filename, prefix: "stems")

    begin
      stems = StemSeparationService.separate_stems(uploaded_file, model: model)
      redis_service.store_result(generation_id, {
        stems: stems, original_filename: original_filename, model: model, created_at: Time.current
      })
    ensure
      uploaded_file.cleanup
    end

    finish_generation
  end

  private

  def redis_service = StemsRedisService.new
  def channel_prefix = "stems"
end
