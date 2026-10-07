class SitemapController < ApplicationController
  PAGES = {
    "/" => "1.0",
    "/work" => "0.9",
    "/resume" => "0.9",
    "/blog" => "0.8",
    "/playground" => "0.7",
    "/hire" => "0.7",
    "/now" => "0.5",
    "/pitch" => "0.4",
    "/midi" => "0.4",
    "/claude" => "0.3"
  }.freeze

  def index
    @pages = PAGES
    @work_items = WorkItem.all
    @playground_items = PlaygroundItem.all
    @courses = Course.all
    @blog_posts = BlogPost.published.recent

    respond_to do |format|
      format.xml
    end
  end
end
