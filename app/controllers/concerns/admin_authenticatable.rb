# Admin authentication for controllers. Included in ApplicationController so
# any controller can ask `admin_signed_in?`; admin-only controllers add
# `before_action :authenticate_admin!`.
module AdminAuthenticatable
  extend ActiveSupport::Concern

  included do
    helper_method :admin_signed_in?
  end

  private

  def authenticate_admin!
    return if admin_signed_in?

    if json_request?
      render json: { error: "Admin sign-in required." }, status: :unauthorized
    else
      session[:admin_return_to] = request.fullpath if request.get?
      redirect_to admin_login_path
    end
  end

  def admin_signed_in?
    admin_session.active?
  end

  def admin_session
    @admin_session ||= AdminSession.new(session)
  end

  def json_request?
    request.format.json? || request.media_type == "application/json"
  end
end
