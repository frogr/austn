class TtsGenerationJob < GpuJob
  sidekiq_options retry: 1

  def perform(generation_id, text, options = {})
    Rails.logger.info "Starting TtsGenerationJob #{generation_id}"
    service = TtsRedisService.new

    # Store initial status
    service.store_status(generation_id, {
      status: "processing",
      started_at: Time.current
    })

    # Broadcast that we're processing
    ActionCable.server.broadcast(
      "tts_generation_#{generation_id}",
      {
        status: "processing",
        generation_id: generation_id
      }
    )

    begin
      # Generate the speech using TTS service
      result = TtsService.generate_speech(
        text,
        exaggeration: options["exaggeration"],
        cfg_weight: options["cfg_weight"],
        voice_audio: options["voice_audio"]
      )

      # Store audio data with service
      audio_data = {
        audio: result[:audio],
        sample_rate: result[:sample_rate],
        duration: result[:duration],
        text: text,
        options: options,
        created_at: Time.current
      }

      service.store_audio(generation_id, audio_data)

      # Update status
      service.store_status(generation_id, {
        status: "completed",
        completed_at: Time.current,
        duration: result[:duration]
      })

      # Broadcast completion
      ActionCable.server.broadcast(
        "tts_generation_#{generation_id}",
        {
          status: "complete",
          generation_id: generation_id,
          duration: result[:duration]
        }
      )

      Rails.logger.info "TtsGenerationJob #{generation_id} completed successfully (#{result[:duration]}s audio)"

    rescue => e
      Rails.logger.error "TtsGenerationJob #{generation_id} failed: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Store error result
      service.store_status(generation_id, {
        status: "failed",
        error: e.message,
        failed_at: Time.current
      }, ttl: 600)

      # Notify failure
      ActionCable.server.broadcast(
        "tts_generation_#{generation_id}",
        {
          status: "failed",
          error: e.message
        }
      )

      # Re-raise to trigger retry logic
      raise
    end
  end

  # Class method to check job status
  def self.check_status(job_id)
    get_result("tts:#{job_id}:status") || { status: "pending" }
  end

  # Class method to get job result
  def self.get_audio_result(job_id)
    get_result("tts:#{job_id}")
  end
end
