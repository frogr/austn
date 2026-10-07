class CoursesController < ApplicationController
  include SitePage
  site_section "hire"

  def show
    @course = Course.find(params[:slug])
  end
end
