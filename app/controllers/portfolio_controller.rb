class PortfolioController < ApplicationController
  def index
    # Hero page with bento box layout
    @latest_blog_posts = BlogPost.order(created_at: :desc).limit(3)
    @featured_projects = [
      {
        id: "ai-tools",
        title: "Austn.net AI Tools Suite",
        description: "7+ free AI tools running on local GPU — image gen, TTS, background removal, and more",
        technologies: [ "Rails", "Python", "ComfyUI", "LMStudio" ]
      },
      {
        id: "pages-ai",
        title: "Pages AI Assistant",
        description: "Natural language document generation that grew adoption 4% → 11%",
        technologies: [ "OpenAI", "Rails", "RubyLLM" ]
      },
      {
        id: "companycam",
        title: "CompanyCam",
        description: "Backend engineering for the #1 construction photo app (140K+ users)",
        technologies: [ "Rails", "PostgreSQL", "GraphQL" ]
      }
    ]
  end

  def projects
    # Projects showcase including games and other work
  end

  def project_detail
    # Individual project detail page
    @project_id = params[:id]
  end

  def tech_setup
    # Tech setup page with hardware and software list
  end

  # Simple static-style pages for Engage links
  def fun_links; end
  def reading; end
  def resources; end
  def resume; end
end
