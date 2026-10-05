# A case study or project page, from content/work/<slug>.md.
#
# Front matter keys:
#   title, summary (one line), tier (featured | more), order, when (e.g. "2023-25"),
#   role, stack (list), links (list of {label, url}), legacy_ids (old /projects/:id slugs)
class WorkItem
  include MarkdownDocument

  TIERS = %w[featured more].freeze

  def self.content_dir = Rails.root.join("content/work")

  def self.featured = all.select(&:featured?)
  def self.more = all.reject(&:featured?)

  def self.for_legacy_id(id)
    all.find { |item| item.slug == id.to_s || item.legacy_ids.include?(id.to_s) }
  end

  def tier = attributes.fetch("tier", "more")
  def featured? = tier == "featured"
  def timeframe = attributes["when"]
  def role = attributes["role"]
  def stack = Array(attributes["stack"])
  def links = Array(attributes["links"])
  def legacy_ids = Array(attributes["legacy_ids"]).map(&:to_s)
end
