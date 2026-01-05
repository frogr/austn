class ImageGenerationJob < GpuJob
  self.gpu_service_name = "images"
  sidekiq_options retry: 1

  def perform(generation_id, prompt, options = {})
    Rails.logger.info "Starting ImageGenerationJob #{generation_id}"
    service = ImageRedisService.new

    broadcast_processing(generation_id, "image_generation")
    service.store_status(generation_id, processing_status)

    result = ComfyService.generate_image(
      prompt,
      negative_prompt: options["negative_prompt"],
      seed: options["seed"],
      image_size: options["image_size"],
      batch_size: options["batch_size"]
    )

    image_data = build_image_data(result, prompt, options)
    should_publish = options["publish"] == true || options["publish"] == "true"
    service.store_image(generation_id, image_data, publish: should_publish)
    service.store_status(generation_id, completed_status)
    broadcast_complete(generation_id, "image_generation")

    Rails.logger.info "ImageGenerationJob #{generation_id} completed successfully"
    mark_service_online
  rescue => e
    handle_failure(e, generation_id, service, "image_generation")
    raise
  end

  def self.check_status(job_id)
    get_result("image:#{job_id}:status") || { status: "pending" }
  end

  def self.get_image_result(job_id)
    get_result("image:#{job_id}")
  end

  private

  def build_image_data(result, prompt, options)
    should_publish = options["publish"] == true || options["publish"] == "true"

    if result.is_a?(Array)
      {
        images: result,
        prompt: prompt,
        options: options,
        created_at: Time.current,
        published: should_publish,
        batch_size: result.length
      }
    else
      {
        base64: result,
        prompt: prompt,
        options: options,
        created_at: Time.current,
        published: should_publish
      }
    end
  end
end
