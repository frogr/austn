class HireController < ApplicationController
  include SitePage
  site_section "hire"

  def show
    @offers = Offer.all
    @how_i_work = Offer.how_i_work
  end
end
