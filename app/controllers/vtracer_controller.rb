class VtracerController < ApplicationController
  include GpuQueueStatus

  skip_before_action :verify_authenticity_token, only: [:generate]

  def index
    # Show the vtracer form
  end

  def generate
    unless params[:image].present?
      render json: { success: false, error: "No image provided" }, status: :bad_request
      return
    end

    generation_id = SecureRandom.uuid

    Rails.logger.info "Starting vtracer generation #{generation_id}"

    # Read and encode the uploaded file
    uploaded_file = params[:image]
    file_data = {
      "base64" => Base64.strict_encode64(uploaded_file.read)
    }
    uploaded_file.rewind

    # Build options from params
    options = {
      "original_filename" => uploaded_file.original_filename
    }

    # Add VTracer parameters if provided (includes both new and legacy param names)
    vtracer_params = %w[
      hierarchical mode filter_speckle color_precision layer_difference
      corner_threshold length_threshold max_iterations splice_threshold path_precision
      gradient_step segment_length
    ]
    vtracer_params.each do |key|
      options[key] = params[key] if params[key].present?
    end

    # Queue the job
    VtracerJob.perform_later(
      generation_id,
      file_data,
      options
    )

    render json: {
      success: true,
      generation_id: generation_id,
      status: "queued",
      check_url: status_vtracer_path(generation_id),
      websocket_channel: "vtracer_#{generation_id}"
    }
  rescue => e
    Rails.logger.error "Failed to queue vtracer generation: #{e.message}"
    render json: { success: false, error: e.message }, status: :internal_server_error
  end

  def status
    generation_id = params[:id]

    if redis_service.result_exists?(generation_id)
      render json: {
        status: "complete",
        result_url: result_vtracer_path(generation_id)
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

    if result_data && result_data["svg"]
      # Generate filename based on original
      original = result_data["original_filename"] || "image.png"
      basename = File.basename(original, ".*")
      filename = "#{basename}.svg"

      send_data result_data["svg"],
                type: "image/svg+xml",
                disposition: "attachment",
                filename: filename
    else
      render json: { error: "Result not found or expired" }, status: :not_found
    end
  end

  def defaults
    render json: { defaults: VtracerService.default_options }
  end

  private

  def redis_service
    @redis_service ||= VtracerRedisService.new
  end
end
