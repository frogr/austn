class CoursesController < ApplicationController
  include SitePage

  def show
    @course = Course.find(params[:slug])
  end
end
