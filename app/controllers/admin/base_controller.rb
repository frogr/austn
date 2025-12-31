module Admin
  class BaseController < ApplicationController
    before_action :authenticate_admin!

    private

    def authenticate_admin!
      return true if session[:admin_authenticated]

      session[:admin_return_to] = request.fullpath
      redirect_to admin_login_path
    end
  end
end
