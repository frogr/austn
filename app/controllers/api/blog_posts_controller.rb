module Api
  class BlogPostsController < ApplicationController
    def index
      @blog_posts = BlogPost.all.order(created_at: :desc)
      render json: @blog_posts
    end

    def show
      @blog_post = BlogPost.find_by(slug: params[:slug])
      if @blog_post
        render json: @blog_post
      else
        render json: { error: "Blog post not found" }, status: :not_found
      end
    end
  end
end