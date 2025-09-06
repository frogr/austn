class PortfolioController < ApplicationController
  def index
    # Hero page with bento box layout
    @latest_blog_posts = BlogPost.order(created_at: :desc).limit(3)
    @featured_projects = [
      {
        id: 'pages-ai',
        title: 'Pages AI Assistant',
        description: 'Natural language document generation that grew adoption 4% → 11%',
        technologies: ['OpenAI', 'Rails', 'RubyLLM'],
        # icon removed (no emojis)
      },
      {
        id: 'bgca',
        title: 'Boys & Girls Club Platform',
        description: '$2MM+ donation processing system',
        technologies: ['Node.js', 'Stripe', 'Heroku'],
        # icon removed (no emojis)
      },
      {
        id: 'hub',
        title: 'Hub - Rails Starter Kit',
        description: 'My opinionated alternative to Jumpstart Pro',
        technologies: ['Rails 7', 'React', 'Docker'],
        # icon removed (no emojis)
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
end
