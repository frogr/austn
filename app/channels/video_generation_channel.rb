class VideoGenerationChannel < ApplicationCable::Channel
  def subscribed
    generation_id = params[:generation_id]

    if generation_id.present?
      stream_from "video_generation_#{generation_id}"
      Rails.logger.info "Client subscribed to video generation channel: #{generation_id}"
    else
      reject
    end
  end

  def unsubscribed
    Rails.logger.info "Client unsubscribed from video generation channel"
  end
end
