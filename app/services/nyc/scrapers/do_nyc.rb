module Nyc
  module Scrapers
    # DoNYC posts curated event listings on their homepage and category
    # pages. We pull a handful of pages, strip them down to text, and let
    # the LLM extract structured events.
    class DoNyc < Nyc::ScraperBase
      PAGES = [
        { url: "https://donyc.com/", label: "homepage" },
        { url: "https://donyc.com/categories/free", label: "free" },
        { url: "https://donyc.com/categories/nightlife", label: "nightlife" }
      ].freeze

      def source_name
        "donyc"
      end

      def fetch_extracted
        PAGES.flat_map do |page|
          html = fetch_page(page[:url])
          next [] if html.blank?
          text = strip_to_text(html)
          next [] if text.blank?
          Nyc::EventExtractor.extract(
            content: "DoNYC #{page[:label]} page (#{page[:url]}):\n\n#{text}",
            source: "DoNYC listing"
          )
        end
      end

      private

      def fetch_page(url)
        response = http_get(url)
        return nil unless response.success?
        response.body
      rescue StandardError => e
        Rails.logger.warn("[donyc] fetch #{url} failed: #{e.class}: #{e.message}")
        nil
      end

      def strip_to_text(html)
        ActionController::Base.helpers.strip_tags(html.to_s).gsub(/\s+/, " ").strip.first(12_000)
      end
    end
  end
end
