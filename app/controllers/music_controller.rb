class MusicController < ApplicationController
  include GpuQueueStatus

  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
    # Show the music generation form
  end

  def generate
    unless params[:tags].present?
      render json: { error: "Tags are required" }, status: :bad_request
      return
    end

    generation_id = SecureRandom.uuid

    Rails.logger.info "Starting music generation #{generation_id} with tags: #{params[:tags]}"

    # Queue the job
    MusicGenerationJob.perform_later(
      generation_id,
      {
        "tags" => params[:tags],
        "lyrics" => params[:lyrics].presence || "[inst]",
        "lyrics_strength" => params[:lyrics_strength],
        "audio_duration" => params[:audio_duration],
        "infer_step" => params[:infer_step],
        "guidance_scale_text" => params[:guidance_scale_text],
        "guidance_scale_lyric" => params[:guidance_scale_lyric],
        "seed" => params[:seed],
        "scheduler" => params[:scheduler],
        "denoise" => params[:denoise],
        "preset" => params[:preset]
      }
    )

    render json: {
      generation_id: generation_id,
      status: "queued",
      check_url: music_status_path(generation_id),
      websocket_channel: "music_generation_#{generation_id}"
    }
  rescue => e
    Rails.logger.error "Failed to queue music generation: #{e.message}"
    render json: { error: e.message }, status: :internal_server_error
  end

  def status
    generation_id = params[:id]

    if redis_service.music_exists?(generation_id)
      render json: {
        status: "complete",
        audio_url: music_result_path(generation_id)
      }
    else
      render json: status_with_queue_position(generation_id, redis_service)
    end
  end

  def result
    generation_id = params[:id]
    music_data = redis_service.get_music(generation_id)

    if music_data && music_data["filename"]
      # Proxy the audio file from ComfyUI
      file_data = ComfyuiClient.get_output_file(
        music_data["filename"],
        subfolder: music_data["subfolder"] || "",
        type: music_data["type"] || "output"
      )

      send_data file_data,
                type: content_type_for(music_data["filename"]),
                disposition: "inline",
                filename: music_data["filename"]
    else
      render json: { error: "Music not found or expired" }, status: :not_found
    end
  rescue ComfyuiClient::ComfyuiError => e
    Rails.logger.error "Failed to proxy music: #{e.message}"
    render json: { error: "Failed to retrieve music" }, status: :internal_server_error
  end

  def download
    generation_id = params[:id]
    music_data = redis_service.get_music(generation_id)

    if music_data && music_data["filename"]
      file_data = ComfyuiClient.get_output_file(
        music_data["filename"],
        subfolder: music_data["subfolder"] || "",
        type: music_data["type"] || "output"
      )

      send_data file_data,
                type: content_type_for(music_data["filename"]),
                disposition: "attachment",
                filename: music_data["filename"]
    else
      render json: { error: "Music not found or expired" }, status: :not_found
    end
  rescue ComfyuiClient::ComfyuiError => e
    Rails.logger.error "Failed to download music: #{e.message}"
    render json: { error: "Failed to retrieve music" }, status: :internal_server_error
  end

  def data
    generation_id = params[:id]
    music_data = redis_service.get_music(generation_id)

    if music_data
      render json: {
        tags: music_data["tags"],
        lyrics: music_data["lyrics"],
        seed: music_data["seed"],
        params: music_data["params"],
        created_at: music_data["created_at"]
      }
    else
      render json: { error: "Music not found or expired" }, status: :not_found
    end
  end

  private

  def redis_service
    @redis_service ||= MusicRedisService.new
  end

  def content_type_for(filename)
    case File.extname(filename).downcase
    when ".wav" then "audio/wav"
    when ".flac" then "audio/flac"
    when ".mp3" then "audio/mpeg"
    when ".ogg" then "audio/ogg"
    else "application/octet-stream"
    end
  end
end
