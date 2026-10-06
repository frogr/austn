class Model3dController < ApplicationController
  include GpuQueueStatus
  include RequiresGpu

  requires_gpu "model3d", only: :generate
  shows_writeup_when_offline "model3d", "image-to-3d", only: :index

  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
  end

  def preview
    @generation_id = params[:id]
    # The view will use model-viewer to display the GLB
  end

  def generate
    upload = GpuUpload.store!(params[:image], kind: :image)
    generation_id = SecureRandom.uuid
    Model3dJob.perform_later(generation_id, upload)

    render json: {
      success: true,
      generation_id: generation_id,
      status: "queued",
      check_url: status_model3d_path(generation_id),
      websocket_channel: "model3d_#{generation_id}"
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
        result_url: result_model3d_path(generation_id),
        preview_url: preview_model3d_path(generation_id)
      }
    else
      render json: status_with_queue_position(generation_id, redis_service)
    end
  end

  def result
    generation_id = params[:id]
    result_data = redis_service.get_result(generation_id)

    if result_data
      render json: {
        original_filename: result_data["original_filename"],
        glb_filename: result_data["glb_filename"],
        created_at: result_data["created_at"],
        download_url: download_model3d_path(generation_id),
        preview_url: preview_model3d_path(generation_id)
      }
    else
      render json: { error: "Result not found or expired" }, status: :not_found
    end
  end

  def download
    generation_id = params[:id]
    result_data = redis_service.get_result(generation_id)
    glb_data = redis_service.get_glb(generation_id)

    if result_data && glb_data
      # Generate filename based on original
      original = result_data["original_filename"] || "image.png"
      basename = File.basename(original, ".*")
      filename = "#{basename}_3d.glb"

      send_data glb_data,
                type: "model/gltf-binary",
                disposition: "attachment",
                filename: filename
    else
      render json: { error: "Model not found or expired" }, status: :not_found
    end
  end

  # Serve GLB file for model-viewer (inline)
  def glb
    generation_id = params[:id]
    glb_data = redis_service.get_glb(generation_id)

    if glb_data
      send_data glb_data,
                type: "model/gltf-binary",
                disposition: "inline"
    else
      render json: { error: "Model not found or expired" }, status: :not_found
    end
  end

  private

  def redis_service
    @redis_service ||= Model3dRedisService.new
  end
end
