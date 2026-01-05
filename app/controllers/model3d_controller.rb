class Model3dController < ApplicationController
  include GpuQueueStatus

  skip_before_action :verify_authenticity_token, only: [:generate]

  def index
    # Load recent models for the index, limited to active (non-expired) ones
    @recent_models = ThreeDModel.active.recent.limit(12)
  end

  def preview
    @generation_id = params[:id]
    # The view will use model-viewer to display the GLB
  end

  def generate
    unless params[:image].present?
      render json: { success: false, error: "No image provided" }, status: :bad_request
      return
    end

    generation_id = SecureRandom.uuid

    Rails.logger.info "Starting 3D model generation #{generation_id}"

    # Read and encode the uploaded file
    uploaded_file = params[:image]
    image_data = uploaded_file.read
    file_data = {
      "base64" => Base64.strict_encode64(image_data)
    }

    # Generate thumbnail for index display (resize to max 200px)
    thumbnail_data = generate_thumbnail(image_data)

    # Queue the job
    Model3dJob.perform_later(
      generation_id,
      file_data,
      {
        "original_filename" => uploaded_file.original_filename,
        "thumbnail_data" => thumbnail_data
      }
    )

    render json: {
      success: true,
      generation_id: generation_id,
      status: "queued",
      check_url: status_model3d_path(generation_id),
      websocket_channel: "model3d_#{generation_id}"
    }
  rescue => e
    Rails.logger.error "Failed to queue 3D model generation: #{e.message}"
    render json: { success: false, error: e.message }, status: :internal_server_error
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

  def generate_thumbnail(image_data)
    # Use ImageMagick via MiniMagick to resize
    require "mini_magick"

    image = MiniMagick::Image.read(image_data)
    image.resize "200x200>"
    image.format "jpeg"
    image.quality 80

    "data:image/jpeg;base64,#{Base64.strict_encode64(image.to_blob)}"
  rescue => e
    Rails.logger.warn "Failed to generate thumbnail: #{e.message}"
    # Fall back to original image as data URL if thumbnail generation fails
    content_type = Marcel::MimeType.for(image_data) || "image/png"
    "data:#{content_type};base64,#{Base64.strict_encode64(image_data)}"
  end
end
