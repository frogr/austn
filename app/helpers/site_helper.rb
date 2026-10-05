module SiteHelper
  def page_title(title)
    content_for(:title, title)
  end

  def page_description(description)
    content_for(:meta_description, description)
  end

  # "2023-25" style timeframe or a date, in the mono metadata style.
  def post_date(post)
    post.published_at&.strftime("%b %Y")
  end
end
