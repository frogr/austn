class WorksController < ApplicationController
  def index
    @work_posts = WorkPost.all.order(created_at: :desc)
    respond_to do |format|
      format.html
      format.json { render json: @work_posts }
    end
  end

  def show
    @work_post = WorkPost.find_by(slug: params[:slug])
    
    respond_to do |format|
      format.html
      format.json { render json: @work_post }
    end
  end
end