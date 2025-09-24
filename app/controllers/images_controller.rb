class ImagesController < ApplicationController
  before_action :set_image, only: [ :show, :edit, :update, :destroy ]
  skip_before_action :verify_authenticity_token, only: [ :generate ]

  def index
    @images = Image.published.ordered

    # Fetch published AI images using service
    @ai_images = image_redis_service.get_published_images
  end

  def show
  end

  def new
    @image = Image.new
  end

  def create
    @image = Image.new(image_params)

    if @image.save
      ImageProcessingJob.perform_later(@image) if @image.file.attached?
      redirect_to @image, notice: "Image was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @image.update(image_params)
      ImageProcessingJob.perform_later(@image) if @image.file.attached?
      redirect_to @image, notice: "Image was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @image.destroy
    redirect_to images_url, notice: "Image was successfully destroyed."
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
        "publish" => params[:publish],
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
    Rails.logger.error "Failed to queue generation: #{e.message}"
    render json: { error: e.message }, status: :internal_server_error
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

    # Check if image is ready
    if image_redis_service.image_exists?(generation_id)
      render json: {
        status: "complete",
        image_url: ai_show_image_path(generation_id)
      }
    else
      # Check status from service
      status = image_redis_service.get_status(generation_id)

      # If status is pending, check Sidekiq queue
      if status[:status] == "pending"
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

  private

  def image_redis_service
    @image_redis_service ||= ImageRedisService.new
  end

  def set_image
    @image = Image.find(params[:id])
  end

  def image_params
    params.require(:image).permit(:title, :description, :position, :published, :file)
  end
end
