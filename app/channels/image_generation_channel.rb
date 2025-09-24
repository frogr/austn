class ImageGenerationChannel < ApplicationCable::Channel
  def subscribed
    generation_id = params[:generation_id]

    if generation_id.present?
      stream_from "image_generation_#{generation_id}"
      Rails.logger.info "Client subscribed to image generation channel: #{generation_id}"
    else
      reject
    end
  end

  def unsubscribed
    Rails.logger.info "Client unsubscribed from image generation channel"
  end
end
