class VtracerJob < GpuJob
  self.gpu_service_name = "vtracer"

  def perform(generation_id, upload, options = {})
    start_generation

    svg = upload.open { |file| VtracerService.convert_to_svg(file.path, options) }
    redis_service.store_result(generation_id, {
      svg: svg, original_filename: upload.filename.to_s, options: options, created_at: Time.current
    })

    finish_generation
    purge_uploads
  end

  private

  def redis_service = VtracerRedisService.new
  def channel_prefix = "vtracer"
end
