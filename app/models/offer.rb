# A service on /hire, read from content/offers.yml. The file's header says
# what each key means.
class Offer
  PATH = Rails.root.join("content/offers.yml")

  def self.data
    @data = nil unless Rails.env.production?
    @data ||= YAML.safe_load_file(PATH).freeze
  end

  def self.all = data.fetch("offers").map { |attributes| new(attributes) }
  def self.pricing = data.fetch("pricing")
  # Marketplace profiles with packaged prices: [{ "label", "url" }], https only.
  def self.profiles = Array(data["profiles"]).select { |profile| profile["url"].to_s.start_with?("https://") }
  def self.find(slug) = all.find { |offer| offer.slug == slug.to_s } || raise(ActiveRecord::RecordNotFound, "No offer named #{slug}")
  def self.how_i_work = data.fetch("how_i_work")

  attr_reader :attributes

  def initialize(attributes)
    @attributes = attributes.freeze
  end

  def slug = attributes.fetch("slug")
  def title = attributes.fetch("title")
  def summary = attributes.fetch("summary")
  def pitch = attributes["pitch"]
  def you_get = Array(attributes["you_get"])
  def timeline = attributes.fetch("timeline")
  def tiers = Array(attributes["tiers"])
  def course_slug = attributes["course"]
  def course
    Course.find(course_slug) if course_slug
  end
  # The side projects that show this offer working.
  def examples = Array(attributes["examples"]).map { |slug| WorkItem.find(slug) }
end
