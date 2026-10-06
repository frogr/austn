class TtsGenerationJob < GpuJob
  # The admin-only custom voice clip travels in the arguments; keep it out of the logs.
  self.log_arguments = false

  self.gpu_service_name = "tts"

  def perform(generation_id, text, options = {})
    start_generation

    result = TtsService.generate_speech(text, options.slice("exaggeration", "cfg_weight", "voice_preset", "voice_audio"))

    redis_service.store_audio(generation_id, {
      audio: result[:audio],
      sample_rate: result[:sample_rate],
      duration: result[:duration],
      text: text,
      options: options.except("voice_audio"),
      created_at: Time.current
    })

    finish_generation(duration: result[:duration])
  end

  private

  def redis_service = TtsRedisService.new
  def channel_prefix = "tts_generation"
end
