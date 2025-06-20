class PortfolioController < ApplicationController
  def index
    # Hero page with bento box layout
  end

  def projects
    # Projects showcase including games and other work
  end

  def project_detail
    # Individual project detail page
    @project_id = params[:id]
  end

  def arena_shooter
    # TF2-inspired arena shooter game
  end

  def tech_setup
    # Tech setup page with hardware and software list
  end
end
