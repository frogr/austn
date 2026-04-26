module Nyc
  class Event < ApplicationRecord
    self.table_name = "nyc_events"

    belongs_to :venue, class_name: "Nyc::Venue", foreign_key: :nyc_venue_id, optional: true

    validates :title, :start_at, :category, :source, :source_id, :dedupe_hash, presence: true
    validates :category, inclusion: { in: Nyc::CATEGORIES }
    validates :dedupe_hash, uniqueness: true

    scope :upcoming, -> { where("start_at >= ?", Time.current).order(:start_at) }
    scope :tonight, -> {
      now = Time.current
      cutoff = now.change(hour: 4) + 1.day # until 4am tomorrow
      where(start_at: now..cutoff).order(:start_at)
    }
    scope :in_window, ->(from, to) { where(start_at: from..to).order(:start_at) }
    scope :by_category, ->(cats) { cats.present? ? where(category: Array(cats)) : all }
    scope :within_bbox, ->(min_lat, max_lat, min_lng, max_lng) {
      joins(:venue).where(nyc_venues: { lat: min_lat..max_lat, lng: min_lng..max_lng })
    }

    def self.dedupe_hash_for(title:, venue_id:, start_at:)
      Digest::SHA1.hexdigest([
        title.to_s.downcase.strip,
        venue_id.to_s,
        start_at.to_date.iso8601
      ].join("|"))
    end

    def color
      Nyc::CATEGORY_COLORS[category] || Nyc::CATEGORY_COLORS["other"]
    end

    def as_map_json
      {
        id: id,
        title: title,
        category: category,
        color: color,
        start_at: start_at.iso8601,
        end_at: end_at&.iso8601,
        price_text: price_text,
        description: description,
        url: url,
        venue: {
          name: venue&.name,
          address: venue&.address,
          neighborhood: venue&.neighborhood,
          lat: venue&.lat,
          lng: venue&.lng
        }
      }
    end
  end
end
