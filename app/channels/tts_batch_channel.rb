class TtsBatchChannel < ApplicationCable::Channel
  def subscribed
    batch_id = params[:batch_id]

    if batch_id.present?
      stream_from "tts_batch_#{batch_id}"
      Rails.logger.info "Client subscribed to TTS batch channel: #{batch_id}"
    else
      reject
    end
  end

  def unsubscribed
    Rails.logger.info "Client unsubscribed from TTS batch channel"
  end
end
