class VtracerController < ApplicationController
  include GpuQueueStatus
  include RequiresGpu

  requires_gpu "vtracer", only: :generate

  skip_before_action :verify_authenticity_token, only: [ :generate ]

  # Includes the legacy names gradient_step and segment_length.
  VTRACER_PARAMS = %i[
    hierarchical mode filter_speckle color_precision layer_difference corner_threshold
    length_threshold max_iterations splice_threshold path_precision gradient_step segment_length
  ].freeze

  def index
    # Show the vtracer form
  end

  def generate
    options = VtracerService.options_for(params.permit(*VTRACER_PARAMS).to_h)
    upload = GpuUpload.store!(params[:image], kind: :image)
    generation_id = SecureRandom.uuid
    VtracerJob.perform_later(generation_id, upload, options.stringify_keys)

    render json: {
      success: true,
      generation_id: generation_id,
      status: "queued",
      check_url: status_vtracer_path(generation_id),
      websocket_channel: "vtracer_#{generation_id}"
    }
  rescue VtracerService::VtracerError, GpuUpload::Invalid => e
    render_invalid_input(e.message)
  rescue => e
    render_gpu_error(e)
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
