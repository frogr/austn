module Admin
  class SessionsController < ApplicationController
    rate_limit to: 10, within: 3.minutes, only: :create, with: -> {
      flash.now[:alert] = "Too many sign-in attempts. Try again in a few minutes."
      render :new, status: :too_many_requests
    }

    def new
      redirect_to admin_root_path if admin_signed_in?
    end

    def create
      if AdminSession.valid_credentials?(params[:username], params[:password])
        return_to = session[:admin_return_to]
        reset_session
        admin_session.sign_in(remember: params[:remember_me] == "1")
        redirect_to return_to || admin_root_path, notice: "Logged in."
      else
        flash.now[:alert] = "Invalid credentials"
        render :new, status: :unprocessable_entity
      end
    end

    def destroy
      reset_session
      redirect_to root_path, notice: "Logged out."
    end
  end
end
