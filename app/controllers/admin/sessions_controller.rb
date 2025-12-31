module Admin
  class SessionsController < ApplicationController
    def new
      # If already authenticated, redirect to admin dashboard
      if session[:admin_authenticated]
        redirect_to admin_root_path
      end
    end

    def create
      expected_username = ENV["ADMIN_USER_NAME"]
      expected_password = ENV["ADMIN_PASSWORD"]

      if expected_username.present? && expected_password.present? &&
         ActiveSupport::SecurityUtils.secure_compare(params[:username].to_s, expected_username) &&
         ActiveSupport::SecurityUtils.secure_compare(params[:password].to_s, expected_password)
        session[:admin_authenticated] = true
        redirect_to session.delete(:admin_return_to) || admin_root_path, notice: "Logged in."
      else
        flash.now[:alert] = "Invalid credentials"
        render :new, status: :unprocessable_entity
      end
    end

    def destroy
      session[:admin_authenticated] = nil
      redirect_to root_path, notice: "Logged out."
    end
  end
end
