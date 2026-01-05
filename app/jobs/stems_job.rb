class StemsJob < GpuJob
  self.gpu_service_name = "stems"
  sidekiq_options retry: 1

  def perform(generation_id, file_data, options = {})
    Rails.logger.info "Starting StemsJob #{generation_id}"
    service = StemsRedisService.new

    # Store initial status
    service.store_status(generation_id, {
      status: "processing",
      started_at: Time.current
    })

    # Broadcast that we're processing
    ActionCable.server.broadcast(
      "stems_#{generation_id}",
      {
        status: "processing",
        generation_id: generation_id
      }
    )

    begin
      # Create a temp file from the base64 data
      original_filename = options["original_filename"] || "audio.mp3"
      extension = File.extname(original_filename).presence || ".mp3"
      temp_file = Tempfile.new(["stems_upload", extension])
      temp_file.binmode
      temp_file.write(Base64.decode64(file_data["base64"]))
      temp_file.rewind

      # Create a file-like object for the service
      uploaded_file = UploadedFileProxy.new(temp_file, original_filename)

      begin
        # Process with StemSeparationService
        stems = StemSeparationService.separate_stems(
          uploaded_file,
          model: options["model"] || StemSeparationService::DEFAULT_MODEL
        )

        # Store result
        result_data = {
          stems: stems,
          original_filename: original_filename,
          model: options["model"] || StemSeparationService::DEFAULT_MODEL,
          created_at: Time.current
        }

        service.store_result(generation_id, result_data)

        # Update status
        service.store_status(generation_id, {
          status: "completed",
          completed_at: Time.current
        })

        # Broadcast completion
        ActionCable.server.broadcast(
          "stems_#{generation_id}",
          {
            status: "complete",
            generation_id: generation_id
          }
        )

        Rails.logger.info "StemsJob #{generation_id} completed successfully"
        mark_service_online

      ensure
        temp_file.close
        temp_file.unlink
      end

    rescue => e
      Rails.logger.error "StemsJob #{generation_id} failed: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Store error result
      service.store_status(generation_id, {
        status: "failed",
        error: e.message,
        failed_at: Time.current
      }, ttl: 600)

      # Notify failure
      ActionCable.server.broadcast(
        "stems_#{generation_id}",
        {
          status: "failed",
          error: e.message
        }
      )

      raise
    end
  end

  # Simple proxy class that mimics an uploaded file
  class UploadedFileProxy
    attr_reader :original_filename

    def initialize(tempfile, original_filename)
      @tempfile = tempfile
      @original_filename = original_filename
    end

    def read
      @tempfile.read
    end

    def rewind
      @tempfile.rewind
    end

    def path
      @tempfile.path
    end
  end
end
