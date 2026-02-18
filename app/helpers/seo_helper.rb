module SeoHelper
  def meta_title(page_title)
    content_for(:title, "#{page_title} | Austin French - Senior Backend Engineer")
  end

  def meta_description(desc)
    content_for(:meta_description, desc)
  end

  def meta_og(options = {})
    tags = "".html_safe
    options.each do |property, value|
      tags << tag.meta(property: "og:#{property}", content: value)
      tags << "\n".html_safe
    end
    content_for(:og_tags, tags)
  end

  def json_ld(data)
    content_for(:json_ld, tag.script(data.to_json.html_safe, type: "application/ld+json"))
  end
end
