# The palette comparison page, and remembering which one a visitor picked.
class PalettesController < ApplicationController
  include SitePage

  def index
    @palettes = Palette.all
  end

  # The choice is a cookie holding a slug. Palette.find ignores anything else.
  def update
    cookies[:palette] = { value: Palette.find(params[:name]).slug, expires: 1.year, same_site: :lax }
    redirect_back fallback_location: root_path
  end
end
