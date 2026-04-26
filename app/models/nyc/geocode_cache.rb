module Nyc
  class GeocodeCache < ApplicationRecord
    self.table_name = "nyc_geocode_cache"

    validates :query, presence: true, uniqueness: true
  end
end
