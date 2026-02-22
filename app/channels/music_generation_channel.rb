class MusicGenerationChannel < ApplicationCable::Channel
  def subscribed
    generation_id = params[:generation_id]

    if generation_id.present?
      stream_from "music_generation_#{generation_id}"
      Rails.logger.info "Client subscribed to music generation channel: #{generation_id}"
    else
      reject
    end
  end

  def unsubscribed
    Rails.logger.info "Client unsubscribed from music generation channel"
  end
end
