module Api
  class GamePostsController < ApplicationController
    def index
      @game_posts = GamePost.all.order(created_at: :desc)
      render json: @game_posts
    end

    def show
      @game_post = GamePost.find_by(slug: params[:slug])
      if @game_post
        render json: @game_post
      else
        render json: { error: "Game post not found" }, status: :not_found
      end
    end
  end
end