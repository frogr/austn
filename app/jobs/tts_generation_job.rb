class TtsGenerationJob < GpuJob
  self.gpu_service_name = "tts"
  sidekiq_options retry: 1

  def perform(generation_id, text, options = {})
    Rails.logger.info "Starting TtsGenerationJob #{generation_id}"
    service = TtsRedisService.new

    broadcast_processing(generation_id, "tts_generation")
    service.store_status(generation_id, processing_status)

    service_opts = build_service_options(generation_id, options)
    result = TtsService.generate_speech(text, service_opts)

    audio_data = {
      audio: result[:audio],
      sample_rate: result[:sample_rate],
      duration: result[:duration],
      text: text,
      options: options,
      created_at: Time.current
    }

    service.store_audio(generation_id, audio_data)
    service.store_status(generation_id, completed_status.merge(duration: result[:duration]))
    broadcast_complete(generation_id, "tts_generation", duration: result[:duration])

    Rails.logger.info "TtsGenerationJob #{generation_id} completed successfully (#{result[:duration]}s audio)"
    mark_service_online
  rescue => e
    handle_failure(e, generation_id, service, "tts_generation")
    raise
  end

  def self.check_status(job_id)
    get_result("tts:#{job_id}:status") || { status: "pending" }
  end

  def self.get_audio_result(job_id)
    get_result("tts:#{job_id}")
  end

  private

  def build_service_options(generation_id, options)
    service_opts = {
      exaggeration: options["exaggeration"],
      cfg_weight: options["cfg_weight"]
    }

    if options["voice_preset"]
      service_opts[:voice_preset] = options["voice_preset"]
      Rails.logger.info "TtsGenerationJob #{generation_id}: voice_preset=#{options["voice_preset"]}"
    elsif options["voice_audio"]
      service_opts[:voice_audio] = options["voice_audio"]
      Rails.logger.info "TtsGenerationJob #{generation_id}: using custom voice audio"
    else
      Rails.logger.info "TtsGenerationJob #{generation_id}: using default voice"
    end

    service_opts
  end
end
