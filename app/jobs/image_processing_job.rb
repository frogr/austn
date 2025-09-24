class ImageProcessingJob < ApplicationJob
  queue_as :default

  def perform(image)
    return unless image.file.attached?

    # Generate different variants for the image
    # These will be created on-demand when first accessed
    variants = {
      thumb: { resize_to_fill: [ 150, 150 ] },
      medium: { resize_to_limit: [ 800, 800 ] },
      large: { resize_to_limit: [ 1920, 1080 ] }
    }

    # Pre-process variants to cache them
    variants.each do |name, options|
      begin
        image.file.variant(options).processed
        Rails.logger.info "Generated #{name} variant for Image ##{image.id}"
      rescue => e
        Rails.logger.error "Failed to generate #{name} variant for Image ##{image.id}: #{e.message}"
      end
    end

    Rails.logger.info "Image processing completed for Image ##{image.id}"
  end
end
