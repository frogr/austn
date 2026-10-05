class Model3dJob < GpuJob
  self.gpu_service_name = "model3d"

  def perform(generation_id, file_data, options = {})
    start_generation

    original_filename = options["original_filename"] || "image.png"
    uploaded_file = UploadedFileProxy.from_base64(file_data["base64"], original_filename: original_filename, prefix: "model3d")

    begin
      result = Model3dService.generate(uploaded_file)
      redis_service.store_glb(generation_id, result[:glb_data])
      redis_service.store_result(generation_id, {
        original_filename: original_filename, glb_filename: result[:filename], created_at: Time.current
      })

      ThreeDModel.create!(
        generation_id: generation_id,
        original_filename: original_filename,
        glb_filename: result[:filename],
        thumbnail_data: options["thumbnail_data"]
      )
    ensure
      uploaded_file.cleanup
    end

    finish_generation
  end

  private

  def redis_service = Model3dRedisService.new
  def channel_prefix = "model3d"
end
