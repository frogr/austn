require "httparty"

module Nyc
  # Free Nominatim geocoder. Caches every lookup in the DB so each unique
  # query only hits the network once. Polite usage requires a real
  # User-Agent and at most 1 req/sec.
  class Geocoder
    include HTTParty
    base_uri "https://nominatim.openstreetmap.org"

    USER_AGENT = "austn.net NYC events aggregator (hi@austn.net)".freeze
    NYC_VIEWBOX = "-74.30,40.95,-73.65,40.45".freeze # left,top,right,bottom

    Result = Struct.new(:lat, :lng, :display_name, keyword_init: true)

    def self.lookup(query)
      return nil if query.blank?
      key = query.to_s.strip.downcase

      cached = Nyc::GeocodeCache.find_by(query: key)
      if cached
        return nil if cached.lat.nil? # negative cache
        return Result.new(lat: cached.lat, lng: cached.lng, display_name: cached.display_name)
      end

      result = remote_lookup(query)
      Nyc::GeocodeCache.create!(
        query: key,
        lat: result&.lat,
        lng: result&.lng,
        display_name: result&.display_name
      )
      result
    rescue ActiveRecord::RecordNotUnique
      retry_cached = Nyc::GeocodeCache.find_by(query: key)
      return nil if retry_cached.nil? || retry_cached.lat.nil?
      Result.new(lat: retry_cached.lat, lng: retry_cached.lng, display_name: retry_cached.display_name)
    end

    def self.remote_lookup(query)
      sleep 1.1 # respect 1 req/sec limit
      response = get("/search", query: {
        q: "#{query}, New York, NY",
        format: "json",
        limit: 1,
        viewbox: NYC_VIEWBOX,
        bounded: 1
      }, headers: { "User-Agent" => USER_AGENT })

      return nil unless response.success?
      hit = response.parsed_response&.first
      return nil unless hit

      Result.new(
        lat: hit["lat"].to_f,
        lng: hit["lon"].to_f,
        display_name: hit["display_name"]
      )
    rescue StandardError => e
      Rails.logger.warn("[Nyc::Geocoder] #{query.inspect} failed: #{e.class}: #{e.message}")
      nil
    end
  end
end
