# Provides admin session authentication for controllers.
# Include in controllers that require admin access.
#
# Example:
#   class TtsBatchesController < ApplicationController
#     include AdminAuthenticatable
#     before_action :authenticate_admin!
#   end
#
module AdminAuthenticatable
  extend ActiveSupport::Concern

  private

  def authenticate_admin!
    return true if session[:admin_authenticated]

    session[:admin_return_to] = request.fullpath
    redirect_to admin_login_path
  end

  def admin_authenticated?
    session[:admin_authenticated].present?
  end
end
