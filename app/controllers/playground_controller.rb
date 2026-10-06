class PlaygroundController < ApplicationController
  include SitePage
  site_section "playground"

  def index
    @items = PlaygroundItem.all
  end

  def show
    @item = PlaygroundItem.find(params[:slug])
  end
end
