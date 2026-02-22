class VideoController < ApplicationController
  include GpuQueueStatus

  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
    # Show the video generation form
  end

  def generate
    unless params[:prompt].present?
      render json: { error: "Prompt is required" }, status: :bad_request
      return
    end

    generation_id = SecureRandom.uuid

    Rails.logger.info "Starting video generation #{generation_id} with prompt: #{params[:prompt]}"

    # Queue the job
    VideoGenerationJob.perform_later(
      generation_id,
      {
        "prompt" => params[:prompt],
        "negative_prompt" => params[:negative_prompt],
        "width" => params[:width],
        "height" => params[:height],
        "length" => params[:length],
        "fps" => params[:fps],
        "steps" => params[:steps],
        "sampler_name" => params[:sampler_name],
        "scheduler" => params[:scheduler],
        "denoise" => params[:denoise],
        "seed" => params[:seed],
        "shift" => params[:shift],
        "preset" => params[:preset]
      }
    )

    render json: {
      generation_id: generation_id,
      status: "queued",
      check_url: video_status_path(generation_id),
      websocket_channel: "video_generation_#{generation_id}"
    }
  rescue => e
    Rails.logger.error "Failed to queue video generation: #{e.message}"
    render json: { error: e.message }, status: :internal_server_error
  end

  def status
    generation_id = params[:id]

    if redis_service.video_exists?(generation_id)
      render json: {
        status: "complete",
        video_url: video_result_path(generation_id)
      }
    else
      render json: status_with_queue_position(generation_id, redis_service)
    end
  end

  def result
    generation_id = params[:id]
    video_data = redis_service.get_video(generation_id)

    if video_data && video_data["filename"]
      # Proxy the video file from ComfyUI
      file_data = ComfyuiClient.get_output_file(
        video_data["filename"],
        subfolder: video_data["subfolder"] || "",
        type: video_data["type"] || "output"
      )

      send_data file_data,
                type: content_type_for(video_data["filename"]),
                disposition: "inline",
                filename: video_data["filename"]
    else
      render json: { error: "Video not found or expired" }, status: :not_found
    end
  rescue ComfyuiClient::ComfyuiError => e
    Rails.logger.error "Failed to proxy video: #{e.message}"
    render json: { error: "Failed to retrieve video" }, status: :internal_server_error
  end

  def download
    generation_id = params[:id]
    video_data = redis_service.get_video(generation_id)

    if video_data && video_data["filename"]
      file_data = ComfyuiClient.get_output_file(
        video_data["filename"],
        subfolder: video_data["subfolder"] || "",
        type: video_data["type"] || "output"
      )

      send_data file_data,
                type: content_type_for(video_data["filename"]),
                disposition: "attachment",
                filename: video_data["filename"]
    else
      render json: { error: "Video not found or expired" }, status: :not_found
    end
  rescue ComfyuiClient::ComfyuiError => e
    Rails.logger.error "Failed to download video: #{e.message}"
    render json: { error: "Failed to retrieve video" }, status: :internal_server_error
  end

  def data
    generation_id = params[:id]
    video_data = redis_service.get_video(generation_id)

    if video_data
      render json: {
        prompt: video_data["prompt"],
        seed: video_data["seed"],
        params: video_data["params"],
        created_at: video_data["created_at"]
      }
    else
      render json: { error: "Video not found or expired" }, status: :not_found
    end
  end

  private

  def redis_service
    @redis_service ||= VideoRedisService.new
  end

  def content_type_for(filename)
    case File.extname(filename).downcase
    when ".webp" then "image/webp"
    when ".mp4" then "video/mp4"
    when ".webm" then "video/webm"
    when ".gif" then "image/gif"
    else "application/octet-stream"
    end
  end
end
