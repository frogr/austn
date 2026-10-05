class RembgController < ApplicationController
  include GpuQueueStatus
  include RequiresGpu

  requires_gpu "rembg", only: :generate

  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
    # Show the rembg form
  end

  def generate
    model = params[:model].presence || RembgService::DEFAULT_MODEL
    return render_invalid_input("Unknown model.") unless RembgService::AVAILABLE_MODELS.include?(model)

    upload = GpuUpload.store!(params[:image], kind: :image)
    generation_id = SecureRandom.uuid
    RembgJob.perform_later(generation_id, upload, { "model" => model })

    render json: {
      success: true,
      generation_id: generation_id,
      status: "queued",
      check_url: status_rembg_path(generation_id),
      websocket_channel: "rembg_#{generation_id}"
    }
  rescue GpuUpload::Invalid => e
    render_invalid_input(e.message)
  rescue => e
    render_gpu_error(e)
  end

  def status
    generation_id = params[:id]

    if redis_service.result_exists?(generation_id)
      render json: {
        status: "complete",
        result_url: result_rembg_path(generation_id)
      }
    else
      render json: status_with_queue_position(generation_id, redis_service)
    end
  end

  def result
    generation_id = params[:id]
    result_data = redis_service.get_result(generation_id)

    if result_data
      render json: result_data
    else
      render json: { error: "Result not found or expired" }, status: :not_found
    end
  end

  def download
    generation_id = params[:id]
    result_data = redis_service.get_result(generation_id)

    if result_data && result_data["base64"]
      # Generate filename based on original
      original = result_data["original_filename"] || "image.png"
      basename = File.basename(original, ".*")
      filename = "#{basename}_nobg.png"

      send_data Base64.decode64(result_data["base64"]),
                type: "image/png",
                disposition: "attachment",
                filename: filename
    else
      render json: { error: "Result not found or expired" }, status: :not_found
    end
  end

  def models
    render json: { models: RembgService::AVAILABLE_MODELS, default: RembgService::DEFAULT_MODEL }
  end

  private

  def redis_service
    @redis_service ||= RembgRedisService.new
  end
end
