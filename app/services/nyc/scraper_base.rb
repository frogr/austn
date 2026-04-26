require "httparty"

module Nyc
  # Base class for source scrapers. Subclasses implement `#fetch_extracted`
  # which returns an array of event hashes (matching EventExtractor's schema).
  # This class handles geocoding, dedupe, and persistence so each scraper
  # only has to worry about its source.
  class ScraperBase
    include HTTParty

    USER_AGENT = "austn.net NYC events aggregator (hi@austn.net)".freeze
    DEFAULT_HEADERS = { "User-Agent" => USER_AGENT, "Accept" => "*/*" }.freeze
    NYC_TZ = ActiveSupport::TimeZone["America/New_York"]

    attr_reader :stats

    def initialize
      @stats = { fetched: 0, created: 0, updated: 0, skipped: 0, geocode_misses: 0 }
    end

    # Subclasses must implement.
    def source_name
      raise NotImplementedError
    end

    # Subclasses must implement; return [{title:, venue_name:, ...}, ...] hashes.
    def fetch_extracted
      raise NotImplementedError
    end

    def call
      events = fetch_extracted
      @stats[:fetched] = events.size
      events.each { |e| persist(e) }
      Rails.logger.info("[#{source_name}] #{stats.inspect}")
      stats
    end

    private

    def persist(raw)
      attrs = raw.is_a?(Hash) ? raw.with_indifferent_access : nil
      return @stats[:skipped] += 1 unless attrs

      title = attrs[:title].to_s.strip
      start_at = parse_time(attrs[:start_datetime])
      category = normalize_category(attrs[:category])
      return @stats[:skipped] += 1 if title.blank? || start_at.nil?
      return @stats[:skipped] += 1 if start_at < 1.day.ago

      venue = find_or_create_venue(attrs[:venue_name], attrs[:address])
      if venue.nil?
        @stats[:geocode_misses] += 1
        return @stats[:skipped] += 1
      end

      dedupe = Nyc::Event.dedupe_hash_for(title: title, venue_id: venue.id, start_at: start_at)
      source_id = (attrs[:url].presence || dedupe).to_s.first(255)

      record = Nyc::Event.find_or_initialize_by(dedupe_hash: dedupe)
      was_new = record.new_record?
      record.assign_attributes(
        title: title,
        venue: venue,
        start_at: start_at,
        end_at: parse_time(attrs[:end_datetime]),
        category: category,
        price_text: attrs[:price_text].presence,
        description: attrs[:description].presence,
        url: attrs[:url].presence,
        source: source_name,
        source_id: source_id
      )
      record.save!
      was_new ? @stats[:created] += 1 : @stats[:updated] += 1
    rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
      Rails.logger.warn("[#{source_name}] persist failed: #{e.class}: #{e.message}")
      @stats[:skipped] += 1
    end

    def find_or_create_venue(name, address)
      return nil if name.blank?
      key = [ name.to_s.strip.downcase, address.to_s.strip.downcase ].reject(&:blank?).join("|")
      existing = Nyc::Venue.find_by(geocode_key: key)
      return existing if existing

      query = address.present? ? "#{name}, #{address}" : name
      result = Nyc::Geocoder.lookup(query)
      return nil if result.nil?

      Nyc::Venue.create!(
        name: name.to_s.strip,
        address: address.presence,
        lat: result.lat,
        lng: result.lng,
        geocode_key: key
      )
    rescue ActiveRecord::RecordNotUnique
      Nyc::Venue.find_by(geocode_key: key)
    end

    def parse_time(raw)
      return nil if raw.blank?
      Time.iso8601(raw.to_s)
    rescue ArgumentError
      begin
        NYC_TZ.parse(raw.to_s)
      rescue StandardError
        nil
      end
    end

    def normalize_category(value)
      v = value.to_s.downcase.strip
      Nyc::CATEGORIES.include?(v) ? v : "other"
    end

    def http_get(url)
      self.class.get(url, headers: DEFAULT_HEADERS, timeout: 20)
    end
  end
end
