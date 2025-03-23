class FrontendController < ApplicationController
  # Disable layout for this controller since we're rendering a React app
  layout false
  
  # Turn off content security policy for development to allow Vite HMR
  content_security_policy false if Rails.env.development?
  
  def show
    # Render the view that includes our React application
    render :show
  end
end