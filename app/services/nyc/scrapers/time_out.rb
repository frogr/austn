module Nyc
  module Scrapers
    # Time Out NY publishes evergreen happy-hour roundups. We treat each
    # listed venue as a recurring "happy_hour" event window. Defaults to
    # tonight if the LLM can't parse a date.
    class TimeOut < Nyc::ScraperBase
      PAGES = [
        { url: "https://www.timeout.com/newyork/bars/best-happy-hour-deals-in-nyc",
          label: "happy hour roundup",
          hint: "Each item is a bar offering a recurring happy hour. If the article lists weekday/time windows, set start_datetime to today's date at the window start. Category is happy_hour." }
      ].freeze

      def source_name
        "time_out"
      end

      def fetch_extracted
        PAGES.flat_map do |page|
          html = fetch_page(page[:url])
          next [] if html.blank?
          text = strip_to_text(html)
          next [] if text.blank?
          Nyc::EventExtractor.extract(
            content: "Time Out NY #{page[:label]}: #{page[:hint]}\n\nURL: #{page[:url]}\n\n#{text}",
            source: "Time Out NY"
          )
        end
      end

      private

      def fetch_page(url)
        response = http_get(url)
        return nil unless response.success?
        response.body
      rescue StandardError => e
        Rails.logger.warn("[time_out] fetch #{url} failed: #{e.class}: #{e.message}")
        nil
      end

      def strip_to_text(html)
        ActionController::Base.helpers.strip_tags(html.to_s).gsub(/\s+/, " ").strip.first(12_000)
      end
    end
  end
end
