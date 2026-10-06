class TtsBatchChannel < ApplicationCable::Channel
  def subscribed
    batch_id = params[:batch_id]
    return reject unless admin && batch_id.present?

    stream_from "tts_batch_#{batch_id}"
  end
end
