class GamesController < ApplicationController
  def index
    @game_posts = GamePost.all.order(created_at: :desc)
    respond_to do |format|
      format.html
      format.json { render json: @game_posts }
    end
  end

  def show
    @game_post = GamePost.find_by(slug: params[:slug])
    
    respond_to do |format|
      format.html
      format.json { render json: @game_post }
    end
  end
end