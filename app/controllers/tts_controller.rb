class TtsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
    # Show list of TTS shares
    @shares = TtsShare.active.order(created_at: :desc)
  end

  def new
    # Fetch available voice presets for the dropdown
    @voices = TtsService.available_voices
  end

  def voices
    # API endpoint to get available voices
    render json: { voices: TtsService.available_voices }
  end

  def generate
    generation_id = SecureRandom.uuid

    # Build options hash - only include values that are present
    options = {
      "exaggeration" => params[:exaggeration],
      "cfg_weight" => params[:cfg_weight]
    }

    # Only add voice params if they're actually provided
    if params[:voice_preset].present?
      options["voice_preset"] = params[:voice_preset]
      Rails.logger.info "TTS #{generation_id}: Using voice preset '#{params[:voice_preset]}'"
    elsif params[:voice_audio].present?
      options["voice_audio"] = params[:voice_audio]
      Rails.logger.info "TTS #{generation_id}: Using custom voice audio"
    else
      Rails.logger.info "TTS #{generation_id}: Using default voice"
    end

    Rails.logger.info "TTS #{generation_id}: text=#{params[:text]&.first(50)}..."

    # Queue the job
    TtsGenerationJob.perform_later(generation_id, params[:text], options)

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

  def share
    generation_id = params[:id]
    audio_data = tts_redis_service.get_audio(generation_id)

    if audio_data && audio_data["audio"]
      share = TtsShare.create!(
        audio_data: audio_data["audio"],
        text: audio_data["text"],
        duration: audio_data["duration"]
      )

      render json: {
        share_url: tts_share_url(share.token),
        token: share.token,
        expires_at: share.expires_at
      }
    else
      render json: { error: "Audio not found or expired" }, status: :not_found
    end
  rescue => e
    Rails.logger.error "Failed to create TTS share: #{e.message}"
    render json: { error: e.message }, status: :internal_server_error
  end

  private

  def tts_redis_service
    @tts_redis_service ||= TtsRedisService.new
  end
end
