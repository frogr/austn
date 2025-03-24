module Api
  class WorkPostsController < ApplicationController
    def index
      @work_posts = WorkPost.all.order(created_at: :desc)
      render json: @work_posts
    end

    def show
      @work_post = WorkPost.find_by(slug: params[:slug])
      if @work_post
        render json: @work_post
      else
        render json: { error: "Work post not found" }, status: :not_found
      end
    end
  end
end