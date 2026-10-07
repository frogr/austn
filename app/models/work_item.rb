# A case study or project page, from content/work/<slug>.md.
#
# Front matter keys:
#   title, summary (one line), tier (featured | more), order, when (e.g. "2023-25"),
#   role, stack (list), links (list of {label, url}), legacy_ids (old /projects/:id slugs),
#   tagline (one short line for the home page), blurb (a plain line for the work
#   index), stats (list of {value, label}),
#   kind (one of KINDS), screenshot (path under public/, shown on the work index),
#   screenshot_alt (what the screenshot shows)
class WorkItem
  include MarkdownDocument

  TIERS = %w[featured more].freeze
  # The work index has three sections. Every case study names one.
  KINDS = { "job" => "Jobs", "project" => "Side projects", "fun" => "For fun" }.freeze

  def self.content_dir = Rails.root.join("content/work")

  def self.featured = all.select(&:featured?)
  def self.more = all.reject(&:featured?)
  def self.of_kind(kind) = all.select { |item| item.kind == kind }

  def self.for_legacy_id(id)
    all.find { |item| item.slug == id.to_s || item.legacy_ids.include?(id.to_s) }
  end

  def tier = attributes.fetch("tier", "more")
  def featured? = tier == "featured"
  def kind = attributes["kind"]
  # One short line for the home page. Falls back to the longer summary.
  def tagline = attributes["tagline"] || summary
  # A plain line for the work index: what the company is and what I did there.
  def blurb = attributes["blurb"] || tagline
  def timeframe = attributes["when"]
  def role = attributes["role"]
  def stack = Array(attributes["stack"])
  def links = Array(attributes["links"])
  # Headline numbers shown above the write-up: a list of {value, label}.
  def stats = Array(attributes["stats"])
  def legacy_ids = Array(attributes["legacy_ids"]).map(&:to_s)
  def screenshot = attributes["screenshot"]
  def screenshot_alt = attributes["screenshot_alt"] || title
end
