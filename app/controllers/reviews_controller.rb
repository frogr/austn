class ReviewsController < Admin::BaseController
  def index
  end

  def create
    review = Review.create!(pr_url: params[:pr_url], status: Review::PENDING)
    ReviewJob.perform_later(review.id)
    render json: { id: review.id, status: review.status }
  end

  def show
    review = Review.includes(:review_sections).find(params[:id])
    render json: review_json(review)
  end

  def add_comment
    section = ReviewSection.find(params[:section_id])
    section.human_comments << { text: params[:text], created_at: Time.current }
    section.save!
    render json: { status: "ok" }
  end

  def synthesize
    review = Review.find(params[:id])
    SynthesizeJob.perform_later(review.id)
    render json: { status: "synthesizing" }
  end

  private

  def authenticate_admin!
    return true if session[:admin_authenticated]

    respond_to do |format|
      format.html do
        session[:admin_return_to] = request.fullpath
        redirect_to admin_login_path
      end
      format.json { render json: { error: "Unauthorized" }, status: :unauthorized }
    end
  end

  def review_json(review)
    {
      id: review.id,
      pr_url: review.pr_url,
      status: review.status,
      triage: review.triage_result,
      synthesis: review.synthesis_result,
      sections: review.review_sections.order(:created_at).map do |s|
        {
          id: s.id, filename: s.filename, language: s.language,
          priority: s.priority, walkthrough: s.walkthrough,
          findings: s.findings, human_comments: s.human_comments,
          status: s.status
        }
      end
    }
  end
end
