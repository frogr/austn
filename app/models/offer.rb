# A service on /hire, read from content/offers.yml. The file's header says
# what each key means.
class Offer
  PATH = Rails.root.join("content/offers.yml")

  def self.data
    @data = nil unless Rails.env.production?
    @data ||= YAML.safe_load_file(PATH).freeze
  end

  def self.all = data.fetch("offers").map { |attributes| new(attributes) }
  def self.find(slug) = all.find { |offer| offer.slug == slug.to_s } || raise(ActiveRecord::RecordNotFound, "No offer named #{slug}")
  def self.how_i_work = data.fetch("how_i_work")

  attr_reader :attributes

  def initialize(attributes)
    @attributes = attributes.freeze
  end

  def slug = attributes.fetch("slug")
  def title = attributes.fetch("title")
  def summary = attributes.fetch("summary")
  def includes = attributes["includes"]
  def duration = attributes["duration"]
  def tiers = Array(attributes["tiers"])
  def course_slug = attributes["course"]
  def proof = Array(attributes["proof"]).map { |slug| WorkItem.find(slug) }

  # "$750" for a fixed price, "from $1,500" for a starting price, and
  # "Scoped per project" when neither is set. Tiered offers price each tier.
  def price_label
    if attributes["price"]
      dollars(attributes["price"])
    elsif attributes["from_price"]
      "from #{dollars(attributes["from_price"])}"
    else
      "Scoped per project"
    end
  end

  # The one-line price for a card: "from $150" for tiers, otherwise price_label.
  def short_price
    tiers.any? ? "from #{dollars(tiers.map { |tier| tier["price"] }.min)}" : price_label
  end

  # The first sentence of the summary, for a card.
  def lead = summary.split(/(?<=\.)\s/).first

  def dollars(amount) = ActiveSupport::NumberHelper.number_to_currency(amount, precision: 0)
end
