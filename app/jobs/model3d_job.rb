class Model3dJob < GpuJob
  self.gpu_service_name = "model3d"

  # Only retry once since 3D generation is expensive
  sidekiq_options retry: 1

  def perform(generation_id, file_data, options = {})
    Rails.logger.info "Starting Model3dJob #{generation_id}"
    service = Model3dRedisService.new

    broadcast_processing(generation_id, "model3d")
    service.store_status(generation_id, processing_status)

    original_filename = options["original_filename"] || "image.png"
    uploaded_file = UploadedFileProxy.from_base64(
      file_data["base64"],
      original_filename: original_filename,
      prefix: "model3d"
    )

    begin
      result = Model3dService.generate(uploaded_file)

      # Store the GLB data
      service.store_glb(generation_id, result[:glb_data])

      result_data = {
        original_filename: original_filename,
        glb_filename: result[:filename],
        created_at: Time.current
      }

      service.store_result(generation_id, result_data)
      service.store_status(generation_id, completed_status)
      broadcast_complete(generation_id, "model3d")

      Rails.logger.info "Model3dJob #{generation_id} completed successfully"
      mark_service_online
    ensure
      uploaded_file.cleanup
    end
  rescue => e
    handle_failure(e, generation_id, service, "model3d")
    raise
  end
end
