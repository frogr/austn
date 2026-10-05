# Older views set their title and description through these. The layouts add
# " · Austin French" to the title.
module SeoHelper
  def meta_title(page_title)
    content_for(:title, page_title)
  end

  def meta_description(desc)
    content_for(:meta_description, desc)
  end
end
