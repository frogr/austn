class SitemapController < ApplicationController
  def index
    @blog_posts = BlogPost.order(updated_at: :desc)

    respond_to do |format|
      format.xml
    end
  end
end
