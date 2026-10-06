class ApplicationController < ActionController::Base
  include AdminAuthenticatable

  helper_method :current_palette

  private

  # The visitor's colour palette, from a cookie set in the footer.
  def current_palette
    Palette.find(cookies[:palette])
  end
end
