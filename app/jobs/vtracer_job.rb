class VtracerJob < GpuJob
  self.gpu_service_name = "vtracer"

  VTRACER_OPTION_KEYS = %w[
    hierarchical mode filter_speckle color_precision layer_difference
    corner_threshold length_threshold max_iterations splice_threshold path_precision
  ].freeze

  def perform(generation_id, file_data, options = {})
    start_generation

    original_filename = options["original_filename"] || "image.png"
    vtracer_options = options.slice(*VTRACER_OPTION_KEYS).compact_blank.symbolize_keys
    uploaded_file = UploadedFileProxy.from_base64(file_data["base64"], original_filename: original_filename, prefix: "vtracer")

    begin
      svg = VtracerService.convert_to_svg(uploaded_file, vtracer_options)
      redis_service.store_result(generation_id, {
        svg: svg, original_filename: original_filename, options: vtracer_options, created_at: Time.current
      })
    ensure
      uploaded_file.cleanup
    end

    finish_generation
  end

  private

  def redis_service = VtracerRedisService.new
  def channel_prefix = "vtracer"
end
