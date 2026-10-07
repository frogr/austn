class HireController < ApplicationController
  include SitePage

  def show
    @offers = Offer.all
    @how_i_work = Offer.how_i_work
  end
end
