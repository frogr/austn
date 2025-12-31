module Api
  module V1
    class BaseController < ActionController::API
      before_action :authenticate_api_key!

      private

      def authenticate_api_key!
        api_key = request.headers["X-API-Key"]
        expected_key = ENV.fetch("TTS_API_KEY", nil)

        unless expected_key.present? && ActiveSupport::SecurityUtils.secure_compare(api_key.to_s, expected_key)
          render json: { error: "Unauthorized" }, status: :unauthorized
        end
      end

      def render_error(message, status: :unprocessable_entity)
        render json: { error: message }, status: status
      end
    end
  end
end
