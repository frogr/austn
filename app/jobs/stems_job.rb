class StemsJob < GpuJob
  self.gpu_service_name = "stems"
  sidekiq_options retry: 1

  def perform(generation_id, file_data, options = {})
    Rails.logger.info "Starting StemsJob #{generation_id}"
    service = StemsRedisService.new

    broadcast_processing(generation_id, "stems")
    service.store_status(generation_id, processing_status)

    original_filename = options["original_filename"] || "audio.mp3"
    uploaded_file = UploadedFileProxy.from_base64(
      file_data["base64"],
      original_filename: original_filename,
      prefix: "stems"
    )

    begin
      model = options["model"] || StemSeparationService::DEFAULT_MODEL
      stems = StemSeparationService.separate_stems(uploaded_file, model: model)

      result_data = {
        stems: stems,
        original_filename: original_filename,
        model: model,
        created_at: Time.current
      }

      service.store_result(generation_id, result_data)
      service.store_status(generation_id, completed_status)
      broadcast_complete(generation_id, "stems")

      Rails.logger.info "StemsJob #{generation_id} completed successfully"
      mark_service_online
    ensure
      uploaded_file.cleanup
    end
  rescue => e
    handle_failure(e, generation_id, service, "stems")
    raise
  end
end
