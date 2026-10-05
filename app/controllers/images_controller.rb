class ImagesController < ApplicationController
  include GpuQueueStatus
  include RequiresGpu

  requires_gpu "images", only: :generate

  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
    @images = Image.published.ordered

    # Fetch published AI images using service
    @ai_images = image_redis_service.get_published_images
  end

  def show
    @image = Image.published.find(params[:id])
  end

  # AI Generation endpoints
  def ai_generate
    # Show the AI generation form
  end

  def generate
    generation_id = SecureRandom.uuid

    Rails.logger.info "Starting generation #{generation_id} with prompt: #{params[:prompt]}"

    # Queue the job
    ImageGenerationJob.perform_later(
      generation_id,
      params[:prompt],
      {
        "negative_prompt" => params[:negative_prompt],
        "seed" => params[:seed],
        "publish" => admin_signed_in? && ActiveModel::Type::Boolean.new.cast(params[:publish]),
        "image_size" => params[:image_size],
        "batch_size" => params[:batch_size]
      }
    )

    # Return immediately with generation ID
    render json: {
      generation_id: generation_id,
      status: "queued",
      check_url: ai_status_image_path(generation_id),
      websocket_channel: "image_generation_#{generation_id}"
    }
  rescue => e
    render_gpu_error(e)
  end

  def ai_show
    # This renders the show page view
    @generation_id = params[:id]
    @image_data = image_redis_service.get_image(@generation_id)

    if @image_data
      # Render the view (ai_show.html.erb)
    else
      redirect_to images_path, alert: "Image not found or expired"
    end
  end

  def ai_image
    # This serves the raw image data
    generation_id = params[:id]
    image_data = image_redis_service.get_image(generation_id)

    if image_data
      # Check if it's a batch (array of images)
      if image_data["images"].is_a?(Array)
        # Get specific image from batch
        image_index = params[:index].to_i || 0
        image_base64 = image_data["images"][image_index]
      else
        # Single image (backward compatibility)
        image_base64 = image_data["base64"]
      end

      # Serve as image directly
      send_data Base64.decode64(image_base64),
                type: "image/png",
                disposition: "inline",
                filename: "generated-#{generation_id}.png"
    else
      render json: { error: "Image not found or expired" }, status: :not_found
    end
  end

  def ai_data
    # Return the full image data as JSON
    generation_id = params[:id]
    image_data = image_redis_service.get_image(generation_id)

    if image_data
      render json: image_data
    else
      render json: { error: "Image not found or expired" }, status: :not_found
    end
  end

  def ai_status
    generation_id = params[:id]

    if image_redis_service.image_exists?(generation_id)
      render json: {
        status: "complete",
        image_url: ai_show_image_path(generation_id)
      }
    else
      render json: status_with_queue_position(generation_id, image_redis_service)
    end
  end

  private

  def image_redis_service
    @image_redis_service ||= ImageRedisService.new
  end

end
