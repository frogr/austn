class TtsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
    # Fetch available voice presets for the dropdown
    @voices = TtsService.available_voices
  end

  def voices
    # API endpoint to get available voices
    render json: { voices: TtsService.available_voices }
  end

  def generate
    generation_id = SecureRandom.uuid

    Rails.logger.info "Starting TTS generation #{generation_id} with text: #{params[:text]&.first(50)}..."

    # Queue the job
    TtsGenerationJob.perform_later(
      generation_id,
      params[:text],
      {
        "exaggeration" => params[:exaggeration],
        "cfg_weight" => params[:cfg_weight],
        "voice_preset" => params[:voice_preset],
        "voice_audio" => params[:voice_audio]
      }
    )

    # Return immediately with generation ID
    render json: {
      generation_id: generation_id,
      status: "queued",
      check_url: tts_status_path(generation_id),
      websocket_channel: "tts_generation_#{generation_id}"
    }
  rescue => e
    Rails.logger.error "Failed to queue TTS generation: #{e.message}"
    render json: { error: e.message }, status: :internal_server_error
  end

  def status
    generation_id = params[:id]

    # Check if audio is ready
    if tts_redis_service.audio_exists?(generation_id)
      audio_data = tts_redis_service.get_audio(generation_id)
      render json: {
        status: "complete",
        duration: audio_data["duration"],
        audio_url: tts_audio_path(generation_id)
      }
    else
      # Check status from service
      status = tts_redis_service.get_status(generation_id)

      # If status is pending, check Sidekiq queue
      if status[:status] == "pending" || status["status"] == "pending"
        queue_position = Sidekiq::Queue.new("gpu").find_index do |job|
          job.args.first == generation_id
        end

        if queue_position
          status = {
            status: "queued",
            position: queue_position + 1
          }
        end
      end

      render json: status
    end
  end

  def audio
    generation_id = params[:id]
    audio_data = tts_redis_service.get_audio(generation_id)

    if audio_data && audio_data["audio"]
      send_data Base64.decode64(audio_data["audio"]),
                type: "audio/wav",
                disposition: "inline",
                filename: "tts-#{generation_id}.wav"
    else
      render json: { error: "Audio not found or expired" }, status: :not_found
    end
  end

  def data
    generation_id = params[:id]
    audio_data = tts_redis_service.get_audio(generation_id)

    if audio_data
      # Don't send the full audio base64 in JSON, just metadata
      render json: {
        text: audio_data["text"],
        duration: audio_data["duration"],
        sample_rate: audio_data["sample_rate"],
        options: audio_data["options"],
        created_at: audio_data["created_at"]
      }
    else
      render json: { error: "Audio not found or expired" }, status: :not_found
    end
  end

  def download
    generation_id = params[:id]
    audio_data = tts_redis_service.get_audio(generation_id)

    if audio_data && audio_data["audio"]
      send_data Base64.decode64(audio_data["audio"]),
                type: "audio/wav",
                disposition: "attachment",
                filename: "tts-#{generation_id}.wav"
    else
      render json: { error: "Audio not found or expired" }, status: :not_found
    end
  end

  private

  def tts_redis_service
    @tts_redis_service ||= TtsRedisService.new
  end
end
