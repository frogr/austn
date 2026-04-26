require "rss"

module Nyc
  module Scrapers
    # The Skint publishes daily curated NYC event roundups via Blogger's
    # public Atom feed. We grab the latest few entries, hand each post to
    # the LLM extractor, and let the base class handle persistence.
    class Skint < Nyc::ScraperBase
      FEED_URL = "https://www.theskint.com/feeds/posts/default".freeze
      MAX_ENTRIES = 5

      def source_name
        "skint"
      end

      def fetch_extracted
        entries = fetch_feed
        return [] if entries.empty?

        entries.flat_map do |entry|
          content = strip_html(entry[:content])
          next [] if content.blank?
          Nyc::EventExtractor.extract(
            content: "Post date: #{entry[:date]}\nTitle: #{entry[:title]}\n\n#{content}",
            source: "The Skint daily post"
          )
        end
      end

      private

      def fetch_feed
        response = http_get(FEED_URL)
        return [] unless response.success?
        feed = RSS::Parser.parse(response.body, false)
        return [] unless feed
        Array(feed.items).first(MAX_ENTRIES).map do |item|
          {
            title: item.respond_to?(:title) ? item.title.to_s : "",
            content: item.respond_to?(:content) && item.content ? item.content.to_s : item.try(:summary).to_s,
            date: item.try(:updated)&.content || item.try(:published)&.content || item.try(:date)
          }
        end
      rescue StandardError => e
        Rails.logger.error("[skint] feed fetch failed: #{e.class}: #{e.message}")
        []
      end

      def strip_html(html)
        return "" if html.blank?
        ActionController::Base.helpers.strip_tags(html.to_s).squeeze(" ").strip.first(8000)
      end
    end
  end
end
