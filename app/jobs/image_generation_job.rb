class ImageGenerationJob < GpuJob
  self.gpu_service_name = "images"
  sidekiq_options retry: 1

  def perform(generation_id, prompt, options = {})
    Rails.logger.info "Starting ImageGenerationJob #{generation_id}"
    service = ImageRedisService.new

    broadcast_processing(generation_id, "image_generation")
    service.store_status(generation_id, processing_status)

    images = ImageGenerationService.generate(
      prompt,
      negative_prompt: options["negative_prompt"],
      seed: options["seed"],
      image_size: (options["image_size"] || 512).to_i,
      batch_size: (options["batch_size"] || 1).to_i
    )

    image_data = build_image_data(images, prompt, options)
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

  # A single image is stored under "base64" and a batch under "images",
  # which is the shape the gallery and image pages read.
  def build_image_data(images, prompt, options)
    should_publish = options["publish"] == true || options["publish"] == "true"
    data = { prompt: prompt, options: options, created_at: Time.current, published: should_publish }

    if images.one?
      data.merge(base64: images.first)
    else
      data.merge(images: images, batch_size: images.length)
    end
  end
end
