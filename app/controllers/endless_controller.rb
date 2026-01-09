class EndlessController < ApplicationController
  def index
    @stories = Story.order(created_at: :desc)
  end

  def show
    @story = Story.find(params[:id])
    @page = [ params[:page].to_i, 1 ].max

    @paragraphs = @story.paragraphs_page(@page)
    @total_pages = @story.total_pages
    @total_paragraphs = @story.paragraph_count
  end

  def paragraphs
    story = Story.find(params[:id])
    page = [ params[:page].to_i, 1 ].max

    paragraphs = story.paragraphs_page(page)
    render json: {
      paragraphs: paragraphs.map(&:as_json_for_api),
      page: page,
      total_pages: story.total_pages,
      total_paragraphs: story.paragraph_count,
      story_title: story.title
    }
  end

  def timer
    story = Story.find(params[:id])
    render json: {
      total_paragraphs: story.paragraph_count
    }
  end
end
