class EndlessController < ApplicationController
  GENERATION_INTERVAL_MINUTES = 10

  def index
    @story = Story.active.first
    @page = [ params[:page].to_i, 1 ].max

    if @story
      @paragraphs = @story.paragraphs_page(@page)
      @total_pages = @story.total_pages
      @total_paragraphs = @story.paragraph_count
    else
      @paragraphs = []
      @total_pages = 1
      @total_paragraphs = 0
    end

    @next_generation = calculate_next_generation_time
    @seconds_until_next = [ (@next_generation - Time.current).to_i, 0 ].max
  end

  def paragraphs
    story = Story.active.first
    page = [ params[:page].to_i, 1 ].max

    if story
      paragraphs = story.paragraphs_page(page)
      render json: {
        paragraphs: paragraphs.map(&:as_json_for_api),
        page: page,
        total_pages: story.total_pages,
        total_paragraphs: story.paragraph_count,
        story_title: story.title,
        next_generation_at: calculate_next_generation_time.iso8601,
        seconds_until_next: [ calculate_next_generation_time - Time.current, 0 ].max.to_i
      }
    else
      render json: {
        paragraphs: [],
        page: 1,
        total_pages: 1,
        total_paragraphs: 0,
        story_title: nil,
        next_generation_at: calculate_next_generation_time.iso8601,
        seconds_until_next: [ calculate_next_generation_time - Time.current, 0 ].max.to_i
      }
    end
  end

  def timer
    story = Story.active.first
    render json: {
      next_generation_at: calculate_next_generation_time.iso8601,
      seconds_until_next: [ calculate_next_generation_time - Time.current, 0 ].max.to_i,
      total_paragraphs: story&.paragraph_count || 0
    }
  end

  private

  def calculate_next_generation_time
    now = Time.current
    minutes_since_last = now.min % GENERATION_INTERVAL_MINUTES
    minutes_until_next = GENERATION_INTERVAL_MINUTES - minutes_since_last

    next_run = now.beginning_of_minute + minutes_until_next.minutes

    next_run += GENERATION_INTERVAL_MINUTES.minutes if minutes_since_last == 0 && now.sec > 5

    next_run
  end
end
