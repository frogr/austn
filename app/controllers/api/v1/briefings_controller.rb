module Api
  module V1
    class BriefingsController < ApplicationController
      skip_before_action :verify_authenticity_token

      RECIPIENT = "austindanielfrench@gmail.com".freeze

      def send_briefing
        subject = params[:subject]
        sections = params[:sections]

        if subject.blank? || sections.blank?
          return render json: { error: "Missing required fields: subject, sections" }, status: :unprocessable_entity
        end

        BriefingMailer.digest(
          recipient: RECIPIENT,
          subject: subject,
          sections: sections.map(&:to_unsafe_h)
        ).deliver_later

        render json: { success: true, message: "Briefing email queued for delivery" }
      rescue StandardError => e
        render json: { error: e.message }, status: :internal_server_error
      end
    end
  end
end
