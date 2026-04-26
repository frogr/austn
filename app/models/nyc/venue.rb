module Nyc
  class Venue < ApplicationRecord
    self.table_name = "nyc_venues"

    has_many :events, class_name: "Nyc::Event", foreign_key: :nyc_venue_id, dependent: :destroy

    validates :name, :lat, :lng, presence: true

    scope :within_bbox, ->(min_lat, max_lat, min_lng, max_lng) {
      where(lat: min_lat..max_lat, lng: min_lng..max_lng)
    }
  end
end
