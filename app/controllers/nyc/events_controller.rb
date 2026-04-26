module Nyc
  class EventsController < ApplicationController
    DEFAULT_CENTER = { lat: 40.7308, lng: -73.9973 }.freeze # roughly NoHo
    DEFAULT_RADIUS_DEG = 0.06 # ~4 miles N/S, ~3 miles E/W in NYC

    def index
      @categories = Nyc::CATEGORIES
      @category_colors = Nyc::CATEGORY_COLORS
      @initial_events = scoped_events.limit(150).includes(:venue)
      @center = DEFAULT_CENTER
      @maptiler_key = ENV["MAPTILER_KEY"].presence
    end

    def map_data
      events = scoped_events.includes(:venue).limit(300)
      render json: { events: events.map(&:as_map_json) }
    end

    private

    def scoped_events
      relation = Nyc::Event.upcoming.includes(:venue)
      relation = relation.by_category(filter_categories) if filter_categories.any?

      bbox = parsed_bbox
      relation = relation.within_bbox(*bbox) if bbox

      window = params[:window].to_s
      case window
      when "tonight"
        relation = relation.tonight
      when "weekend"
        from = Time.current
        to = (from.end_of_week + 1.day).end_of_day
        relation = relation.in_window(from, to)
      end

      relation
    end

    def filter_categories
      Array(params[:categories]).map(&:to_s) & Nyc::CATEGORIES
    end

    def parsed_bbox
      return nil unless params[:min_lat] && params[:max_lat] && params[:min_lng] && params[:max_lng]
      [
        params[:min_lat].to_f,
        params[:max_lat].to_f,
        params[:min_lng].to_f,
        params[:max_lng].to_f
      ]
    end
  end
end
