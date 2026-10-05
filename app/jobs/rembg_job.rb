class RembgJob < GpuJob
  self.gpu_service_name = "rembg"

  def perform(generation_id, file_data, options = {})
    start_generation

    original_filename = options["original_filename"] || "image.png"
    model = options["model"] || RembgService::DEFAULT_MODEL
    uploaded_file = UploadedFileProxy.from_base64(file_data["base64"], original_filename: original_filename, prefix: "rembg")

    begin
      result = RembgService.remove_background(uploaded_file, model: model)
      redis_service.store_result(generation_id, {
        base64: result, original_filename: original_filename, model: model, created_at: Time.current
      })
    ensure
      uploaded_file.cleanup
    end

    finish_generation
  end

  private

  def redis_service = RembgRedisService.new
  def channel_prefix = "rembg"
end
