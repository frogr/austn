class PagesController < ApplicationController
  include SitePage

  def home
    @featured_work = WorkItem.featured
    @recent_posts = BlogPost.published.recent.limit(3)
  end

  def now; end
end
