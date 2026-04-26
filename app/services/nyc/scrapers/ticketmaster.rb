module Nyc
  module Scrapers
    # Ticketmaster Discovery API adapter. No-op until TICKETMASTER_API_KEY
    # is set; once it is, we pull NYC events keyed off lat/long + radius.
    # 5,000 calls/day, 5 req/sec on the free tier.
    class Ticketmaster < Nyc::ScraperBase
      API_URL = "https://app.ticketmaster.com/discovery/v2/events.json".freeze
      NYC_LAT = 40.7580
      NYC_LNG = -73.9855
      RADIUS_MILES = 8

      CLASSIFICATION_TO_CATEGORY = {
        "music" => "concert",
        "sports" => "sports",
        "arts & theatre" => "comedy",
        "miscellaneous" => "other"
      }.freeze

      def source_name
        "ticketmaster"
      end

      def fetch_extracted
        api_key = ENV["TICKETMASTER_API_KEY"]
        if api_key.blank?
          Rails.logger.info("[ticketmaster] TICKETMASTER_API_KEY not set, skipping")
          return []
        end

        response = self.class.get(API_URL, query: {
          apikey: api_key,
          latlong: "#{NYC_LAT},#{NYC_LNG}",
          radius: RADIUS_MILES,
          unit: "miles",
          size: 100,
          sort: "date,asc",
          startDateTime: Time.current.utc.strftime("%Y-%m-%dT%H:%M:%SZ")
        }, headers: DEFAULT_HEADERS, timeout: 30)

        return [] unless response.success?
        events = response.parsed_response.dig("_embedded", "events") || []
        events.map { |e| normalize(e) }.compact
      rescue StandardError => e
        Rails.logger.error("[ticketmaster] fetch failed: #{e.class}: #{e.message}")
        []
      end

      private

      def normalize(event)
        venue = event.dig("_embedded", "venues", 0)
        return nil unless venue && venue["name"]
        classification = event.dig("classifications", 0, "segment", "name").to_s.downcase
        price_range = event.dig("priceRanges", 0)

        {
          title: event["name"],
          venue_name: venue["name"],
          address: [ venue.dig("address", "line1"), venue.dig("city", "name") ].compact.join(", ").presence,
          start_datetime: event.dig("dates", "start", "dateTime"),
          end_datetime: nil,
          category: CLASSIFICATION_TO_CATEGORY[classification] || "other",
          price_text: price_range ? "$#{price_range['min'].to_i}-#{price_range['max'].to_i}" : nil,
          url: event["url"],
          description: event.dig("info") || event["name"]
        }
      end
    end
  end
end
