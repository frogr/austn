module Admin
  class TtsSharesController < BaseController
    def index
      @shares = TtsShare.order(created_at: :desc)
      @active_count = TtsShare.active.count
      @expired_count = TtsShare.expired.count
      @voices = TtsService.available_voices
    end

    def destroy
      @share = TtsShare.find(params[:id])
      @share.destroy
      redirect_to admin_tts_shares_path, notice: "TTS share deleted."
    end

    def bulk_destroy
      if params[:ids].present?
        TtsShare.where(id: params[:ids]).destroy_all
        redirect_to admin_tts_shares_path, notice: "Selected shares deleted."
      else
        redirect_to admin_tts_shares_path, alert: "No shares selected."
      end
    end

    def cleanup_expired
      count = TtsShare.cleanup_expired!
      redirect_to admin_tts_shares_path, notice: "Cleaned up #{count} expired shares."
    end
  end
end
