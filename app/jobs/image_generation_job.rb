class ImageGenerationJob < GpuJob
  self.gpu_service_name = "images"

  def perform(generation_id, prompt, options = {})
    start_generation

    images = ImageGenerationService.generate(
      prompt,
      negative_prompt: options["negative_prompt"],
      seed: options["seed"],
      image_size: (options["image_size"] || 512).to_i,
      batch_size: (options["batch_size"] || 1).to_i
    )

    publish = ActiveModel::Type::Boolean.new.cast(options["publish"]) || false
    redis_service.store_image(generation_id, image_data(images, prompt, options, publish), publish: publish)

    finish_generation
  end

  private

  def redis_service = ImageRedisService.new
  def channel_prefix = "image_generation"

  # A single image is stored under "base64" and a batch under "images",
  # which is the shape the gallery and image pages read.
  def image_data(images, prompt, options, published)
    data = { prompt: prompt, options: options, created_at: Time.current, published: published }

    if images.one?
      data.merge(base64: images.first)
    else
      data.merge(images: images, batch_size: images.length)
    end
  end
end
