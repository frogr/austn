class TtsSharesController < ApplicationController
  def show
    @share = TtsShare.find_by(token: params[:token])

    if @share.nil? || @share.expired?
      @expired = true
      render :expired and return
    end
  end

  def embed
    @share = TtsShare.active.find_by(token: params[:token])
    render layout: false
  end

  def audio
    share = TtsShare.find_by(token: params[:token])

    if share.nil? || share.expired?
      render json: { error: "Audio not found or expired" }, status: :not_found
    else
      send_data Base64.decode64(share.audio_data),
                type: "audio/wav",
                disposition: "inline",
                filename: "tts-#{share.token}.wav"
    end
  end
end
