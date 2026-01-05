class VtracerJob < GpuJob
  self.gpu_service_name = "vtracer"
  sidekiq_options retry: 1

  VTRACER_OPTION_KEYS = %w[
    filter_speckle color_precision gradient_step
    corner_threshold segment_length splice_threshold
  ].freeze

  def perform(generation_id, file_data, options = {})
    Rails.logger.info "Starting VtracerJob #{generation_id}"
    service = VtracerRedisService.new

    broadcast_processing(generation_id, "vtracer")
    service.store_status(generation_id, processing_status)

    original_filename = options["original_filename"] || "image.png"
    uploaded_file = UploadedFileProxy.from_base64(
      file_data["base64"],
      original_filename: original_filename,
      prefix: "vtracer"
    )

    begin
      vtracer_options = extract_vtracer_options(options)
      svg_content = VtracerService.convert_to_svg(uploaded_file, vtracer_options)

      result_data = {
        svg: svg_content,
        original_filename: original_filename,
        options: vtracer_options,
        created_at: Time.current
      }

      service.store_result(generation_id, result_data)
      service.store_status(generation_id, completed_status)
      broadcast_complete(generation_id, "vtracer")

      Rails.logger.info "VtracerJob #{generation_id} completed successfully"
      mark_service_online
    ensure
      uploaded_file.cleanup
    end
  rescue => e
    handle_failure(e, generation_id, service, "vtracer")
    raise
  end

  private

  def extract_vtracer_options(options)
    VTRACER_OPTION_KEYS.each_with_object({}) do |key, hash|
      hash[key.to_sym] = options[key] if options[key].present?
    end
  end
end
