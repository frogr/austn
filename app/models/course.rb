# A course with a page at /courses/<slug>, read from content/courses.yml.
# The file's header says what each key means.
class Course
  PATH = Rails.root.join("content/courses.yml")

  def self.all
    @all = nil unless Rails.env.production?
    @all ||= YAML.safe_load_file(PATH).fetch("courses").map { |attributes| new(attributes) }.freeze
  end

  def self.find(slug)
    all.find { |course| course.slug == slug.to_s } || raise(ActiveRecord::RecordNotFound, "No course named #{slug}")
  end

  attr_reader :attributes

  def initialize(attributes)
    @attributes = attributes.freeze
  end

  def slug = attributes.fetch("slug")
  def title = attributes.fetch("title")
  def summary = attributes.fetch("summary")
  def price = attributes.fetch("price")
  def regular_price = attributes["regular_price"]
  def buy_url = https_url(attributes["buy_url"])
  def on_sale? = buy_url.present?
  def starter_url = https_url(attributes["starter_url"])
  def lessons = attributes.fetch("lessons")
  def to_param = slug

  # Links in the YAML must be https. Anything else (a typo, a javascript: URL)
  # is treated as missing, so the page never links to it.
  def https_url(value)
    value if value.present? && URI.parse(value).is_a?(URI::HTTPS)
  rescue URI::InvalidURIError
    nil
  end

  # The free sample lesson, once its blog post is published.
  def sample_post
    slug = attributes["sample_post"]
    BlogPost.published.find_by(slug: slug) if slug
  end
end
