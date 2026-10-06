class RembgJob < GpuJob
  self.gpu_service_name = "rembg"

  def perform(generation_id, upload, options = {})
    start_generation

    model = options["model"] || RembgService::DEFAULT_MODEL
    image = upload.open { |file| RembgService.remove_background(file.path, model: model) }
    redis_service.store_result(generation_id, {
      base64: image, original_filename: upload.filename.to_s, model: model, created_at: Time.current
    })

    finish_generation
    purge_uploads
  end

  private

  def redis_service = RembgRedisService.new
  def channel_prefix = "rembg"
end
