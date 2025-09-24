class ImageGenerationJob < GpuJob
  sidekiq_options retry: 1

  def perform(generation_id, prompt, options = {})
    Rails.logger.info "Starting ImageGenerationJob #{generation_id}"

    # Store initial status
    store_result("image:#{generation_id}:status", {
      status: "processing",
      started_at: Time.current
    })

    # Broadcast that we're processing
    ActionCable.server.broadcast(
      "image_generation_#{generation_id}",
      {
        status: 'processing',
        generation_id: generation_id
      }
    )

    begin
      # Generate the image(s) using ComfyUI
      result = ComfyService.generate_image(
        prompt,
        negative_prompt: options['negative_prompt'],
        seed: options['seed'],
        image_size: options['image_size'],
        batch_size: options['batch_size']
      )

      # Store temporarily in Redis (expires in 10 minutes)
      # Handle both single images and batch
      image_data = if result.is_a?(Array)
        {
          images: result,  # Array of base64 images
          prompt: prompt,
          options: options,
          created_at: Time.current,
          published: options['publish'] == true || options['publish'] == 'true',
          batch_size: result.length
        }
      else
        {
          base64: result,  # Single base64 image
          prompt: prompt,
          options: options,
          created_at: Time.current,
          published: options['publish'] == true || options['publish'] == 'true'
        }
      end

      store_result("image:#{generation_id}", image_data, ttl: 600)

      # If published, add to published images list
      if options['publish'] == true || options['publish'] == 'true'
        redis = Redis.new(url: Rails.application.config_for(:redis)["url"])
        # Add to sorted set with timestamp as score
        redis.zadd("published_ai_images", Time.current.to_i, generation_id)
        # Set expiry on the sorted set member (cleanup old ones periodically)
        redis.expire("published_ai_images", 3600) # Keep list for 1 hour
      end

      # Update status
      store_result("image:#{generation_id}:status", {
        status: "completed",
        completed_at: Time.current
      })

      # Broadcast completion
      ActionCable.server.broadcast(
        "image_generation_#{generation_id}",
        {
          status: 'complete',
          generation_id: generation_id
        }
      )

      Rails.logger.info "ImageGenerationJob #{generation_id} completed successfully"

    rescue => e
      Rails.logger.error "ImageGenerationJob #{generation_id} failed: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      # Store error result
      store_result("image:#{generation_id}:status", {
        status: "failed",
        error: e.message,
        failed_at: Time.current
      }, ttl: 600)

      # Notify failure
      ActionCable.server.broadcast(
        "image_generation_#{generation_id}",
        {
          status: 'failed',
          error: e.message
        }
      )

      # Re-raise to trigger retry logic
      raise
    end
  end

  # Class method to check job status
  def self.check_status(job_id)
    get_result("image_job:#{job_id}:status") || { status: "pending" }
  end

  # Class method to get job result
  def self.get_image_result(job_id)
    get_result("image_job:#{job_id}")
  end
end
