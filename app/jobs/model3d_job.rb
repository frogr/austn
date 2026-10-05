class Model3dJob < GpuJob
  self.gpu_service_name = "model3d"

  def perform(generation_id, upload)
    start_generation

    result = upload.open { |file| Model3dService.generate(file.path) }
    redis_service.store_glb(generation_id, result[:glb_data])
    redis_service.store_result(generation_id, {
      original_filename: upload.filename.to_s, glb_filename: result[:filename], created_at: Time.current
    })

    finish_generation
    purge_uploads
  end

  private

  def redis_service = Model3dRedisService.new
  def channel_prefix = "model3d"
end
