class PagesController < ApplicationController
  include SitePage

  def home
    @featured_work = WorkItem.featured
    @recent_posts = BlogPost.published.recent.limit(3)
    @toys = PlaygroundItem.all.select(&:live_path)
  end

  def now; end
end
