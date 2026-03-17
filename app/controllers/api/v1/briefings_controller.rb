module Api
  module V1
    class BriefingsController < ApplicationController
      skip_before_action :verify_authenticity_token
      before_action :authenticate_api_key

      def send_briefing
        recipient = params[:recipient]
        subject = params[:subject]
        sections = params[:sections]

        if recipient.blank? || subject.blank? || sections.blank?
          return render json: { error: "Missing required fields: recipient, subject, sections" }, status: :unprocessable_entity
        end

        BriefingMailer.digest(
          recipient: recipient,
          subject: subject,
          sections: sections.map(&:to_unsafe_h)
        ).deliver_later

        render json: { success: true, message: "Briefing email queued for delivery to #{recipient}" }
      rescue StandardError => e
        render json: { error: e.message }, status: :internal_server_error
      end

      private

      def authenticate_api_key
        api_key = ENV["BRIEFING_API_KEY"]
        token = request.headers["Authorization"]&.remove("Bearer ")

        if api_key.blank?
          render json: { error: "BRIEFING_API_KEY not configured" }, status: :service_unavailable
          return
        end

        unless ActiveSupport::SecurityUtils.secure_compare(token.to_s, api_key)
          render json: { error: "Unauthorized" }, status: :unauthorized
        end
      end
    end
  end
end
