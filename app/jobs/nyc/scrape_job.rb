module Nyc
  class ScrapeJob < ApplicationJob
    queue_as :low

    SCRAPERS = {
      "skint"        => Nyc::Scrapers::Skint,
      "donyc"        => Nyc::Scrapers::DoNyc,
      "time_out"     => Nyc::Scrapers::TimeOut,
      "ticketmaster" => Nyc::Scrapers::Ticketmaster
    }.freeze

    def perform(name)
      klass = SCRAPERS[name.to_s]
      raise ArgumentError, "unknown scraper: #{name.inspect}" unless klass
      klass.new.call
    end
  end
end
