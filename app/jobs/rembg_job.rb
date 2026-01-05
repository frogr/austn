class RembgJob < GpuJob
  self.gpu_service_name = "rembg"
  sidekiq_options retry: 1

  def perform(generation_id, file_data, options = {})
    Rails.logger.info "Starting RembgJob #{generation_id}"
    service = RembgRedisService.new

    broadcast_processing(generation_id, "rembg")
    service.store_status(generation_id, processing_status)

    original_filename = options["original_filename"] || "image.png"
    uploaded_file = UploadedFileProxy.from_base64(
      file_data["base64"],
      original_filename: original_filename,
      prefix: "rembg"
    )

    begin
      result = RembgService.remove_background(
        uploaded_file,
        model: options["model"] || RembgService::DEFAULT_MODEL
      )

      result_data = {
        base64: result,
        original_filename: original_filename,
        model: options["model"] || RembgService::DEFAULT_MODEL,
        created_at: Time.current
      }

      service.store_result(generation_id, result_data)
      service.store_status(generation_id, completed_status)
      broadcast_complete(generation_id, "rembg")

      Rails.logger.info "RembgJob #{generation_id} completed successfully"
      mark_service_online
    ensure
      uploaded_file.cleanup
    end
  rescue => e
    handle_failure(e, generation_id, service, "rembg")
    raise
  end
end
