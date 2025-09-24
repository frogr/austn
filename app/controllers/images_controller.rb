class ImagesController < ApplicationController
  before_action :set_image, only: [ :show, :edit, :update, :destroy ]
  skip_before_action :verify_authenticity_token, only: [:generate]

  def index
    @images = Image.published.ordered

    # Fetch published AI images from Redis
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    ai_image_ids = redis.zrevrange("published_ai_images", 0, -1)

    @ai_images = []
    ai_image_ids.each do |id|
      image_data = redis.get("image:#{id}")
      if image_data
        parsed = JSON.parse(image_data)
        # Handle both single and batch images
        if parsed['images']
          # For batch, just show first image as thumbnail
          @ai_images << {
            id: id,
            prompt: parsed['prompt'],
            created_at: parsed['created_at'],
            base64: parsed['images'].first,
            batch_size: parsed['batch_size']
          }
        elsif parsed['base64']
          @ai_images << {
            id: id,
            prompt: parsed['prompt'],
            created_at: parsed['created_at'],
            base64: parsed['base64']
          }
        end
      end
    end
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
        'negative_prompt' => params[:negative_prompt],
        'seed' => params[:seed],
        'publish' => params[:publish],
        'image_size' => params[:image_size],
        'batch_size' => params[:batch_size]
      }
    )

    # Return immediately with generation ID
    render json: {
      generation_id: generation_id,
      status: 'queued',
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
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    data = redis.get("image:#{@generation_id}")

    if data
      @image_data = JSON.parse(data)
      # Render the view (ai_show.html.erb)
    else
      redirect_to images_path, alert: 'Image not found or expired'
    end
  end

  def ai_image
    # This serves the raw image data
    generation_id = params[:id]
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    data = redis.get("image:#{generation_id}")

    if data
      parsed = JSON.parse(data)

      # Check if it's a batch (array of images)
      if parsed['images'].is_a?(Array)
        # Get specific image from batch
        image_index = params[:index].to_i || 0
        image_base64 = parsed['images'][image_index]
      else
        # Single image (backward compatibility)
        image_base64 = parsed['base64']
      end

      # Serve as image directly
      send_data Base64.decode64(image_base64),
                type: 'image/png',
                disposition: 'inline',
                filename: "generated-#{generation_id}.png"
    else
      render json: { error: 'Image not found or expired' }, status: :not_found
    end
  end

  def ai_data
    # Return the full image data as JSON
    generation_id = params[:id]
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
    data = redis.get("image:#{generation_id}")

    if data
      render json: JSON.parse(data)
    else
      render json: { error: 'Image not found or expired' }, status: :not_found
    end
  end

  def ai_status
    generation_id = params[:id]
    redis = Redis.new(url: Rails.application.config_for(:redis)["url"])

    # Check if image is ready
    if redis.exists?("image:#{generation_id}")
      render json: {
        status: 'complete',
        image_url: ai_show_image_path(generation_id)
      }
    else
      # Check status
      status_data = redis.get("image:#{generation_id}:status")
      if status_data
        status = JSON.parse(status_data)
        render json: status
      else
        # Check if job is still in queue
        queue_position = Sidekiq::Queue.new('gpu').find_index do |job|
          job.args.first == generation_id
        end

        if queue_position
          render json: {
            status: 'queued',
            position: queue_position + 1
          }
        else
          render json: {
            status: 'pending'
          }
        end
      end
    end
  end

  private

  def set_image
    @image = Image.find(params[:id])
  end

  def image_params
    params.require(:image).permit(:title, :description, :position, :published, :file)
  end
end
