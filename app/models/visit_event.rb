# One thing a visitor did: a page view, a click on a link that leaves the
# site (through /go), or a booking. The path is the page it happened on.
class VisitEvent < ApplicationRecord
  belongs_to :visit

  NAMES = %w[page_view click booking].freeze

  validates :name, inclusion: { in: NAMES }

  scope :page_views, -> { where(name: "page_view") }
  scope :clicks, -> { where(name: "click") }
  scope :bookings, -> { where(name: "booking") }
  scope :actions, -> { where.not(name: "page_view") }
  scope :since, ->(time) { where(created_at: time..) }

  def page_view? = name == "page_view"
end
