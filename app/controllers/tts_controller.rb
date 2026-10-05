class TtsController < ApplicationController
  include GpuQueueStatus
  include RequiresGpu

  requires_gpu "tts", only: :generate
  shows_writeup_when_offline "tts", "text-to-speech", only: [ :index, :new ]
  before_action :restrict_custom_voices_to_admin, only: :generate

  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
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
    text = params[:text].to_s.strip
    return render_invalid_input("Type something to say.") if text.empty?
    if text.length > TtsService::MAX_TEXT_LENGTH
      return render_invalid_input("Keep it under #{TtsService::MAX_TEXT_LENGTH} characters.")
    end

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

    TtsGenerationJob.perform_later(generation_id, text, options)

    # Return immediately with generation ID
    render json: {
      generation_id: generation_id,
      status: "queued",
      check_url: tts_status_path(generation_id),
      websocket_channel: "tts_generation_#{generation_id}"
    }
  rescue => e
    render_gpu_error(e)
  end

  def status
    generation_id = params[:id]

    if tts_redis_service.audio_exists?(generation_id)
      audio_data = tts_redis_service.get_audio(generation_id)
      render json: {
        status: "complete",
        duration: audio_data["duration"],
        audio_url: tts_audio_path(generation_id)
      }
    else
      render json: status_with_queue_position(generation_id, tts_redis_service)
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
      voice_preset = audio_data.dig("options", "voice_preset")

      share = TtsShare.create!(
        audio_data: audio_data["audio"],
        text: audio_data["text"],
        duration: audio_data["duration"],
        voice_preset: voice_preset
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
    render_gpu_error(e)
  end

  private

  # Cloning a voice from an uploaded clip is only for the admin.
  def restrict_custom_voices_to_admin
    return if params[:voice_audio].blank? || admin_signed_in?

    render json: { success: false, error_code: "forbidden", error: "Custom voice uploads aren't available." },
           status: :forbidden
  end

  def tts_redis_service
    @tts_redis_service ||= TtsRedisService.new
  end
end
