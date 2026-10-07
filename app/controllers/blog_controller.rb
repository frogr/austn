class BlogController < ApplicationController
  include SitePage
  site_section "writing"

  def index
    @blog_posts = BlogPost.published.recent
  end

  def show
    @blog_post = BlogPost.published.find_by!(slug: params[:slug])
    @more_posts = BlogPost.published.recent.where.not(id: @blog_post.id).limit(4)
  end
end
