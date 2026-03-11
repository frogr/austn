class ReviewsController < Admin::BaseController
  def index
  end

  def create
    unless Harness.configuration&.api_key.present?
      return render json: { error: "OPENAI_API_KEY is not configured on the server." },
                    status: :service_unavailable
    end

    review = Review.create!(pr_url: params[:pr_url], status: Review::PENDING)
    ReviewJob.perform_later(review.id)
    render json: { id: review.id, status: review.status }
  end

  def show
    review = Review.includes(:review_sections, :harness_requests).find(params[:id])
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

  def decide
    review = Review.find(params[:id])
    review.update!(
      decision: params[:decision],
      decision_comment: params[:comment]
    )
    render json: { status: "ok", decision: review.decision }
  end

  def audit
    review = Review.includes(:harness_requests).find(params[:id])
    render json: audit_json(review)
  end

  private

  def review_json(review)
    {
      id: review.id,
      pr_url: review.pr_url,
      status: review.status,
      decision: review.decision,
      decision_comment: review.decision_comment,
      triage: review.triage_result,
      synthesis: review.synthesis_result,
      total_findings: review.total_findings,
      red_flags: review.red_flags,
      warnings: review.warnings,
      created_at: review.created_at,
      cost: {
        total_cost: review.total_cost.to_f.round(6),
        total_tokens: review.total_tokens,
        request_count: review.harness_requests.count
      },
      sections: review.review_sections.order(:created_at).map do |s|
        {
          id: s.id, filename: s.filename, language: s.language,
          priority: s.priority, walkthrough: s.walkthrough,
          patch_text: s.patch_text, findings: s.findings,
          human_comments: s.human_comments, status: s.status
        }
      end
    }
  end

  def audit_json(review)
    {
      review_id: review.id,
      pr_url: review.pr_url,
      total_cost: review.total_cost.to_f.round(6),
      total_tokens: review.total_tokens,
      requests: review.harness_requests.order(:created_at).map do |r|
        {
          id: r.id,
          request_type: r.request_type,
          provider: r.provider,
          model: r.model,
          status: r.status,
          input_tokens: r.input_tokens,
          output_tokens: r.output_tokens,
          estimated_cost: r.estimated_cost.to_f.round(6),
          duration_seconds: r.duration_seconds&.round(2),
          error_message: r.error_message,
          system_prompt: r.system_prompt,
          user_prompt: r.user_prompt,
          raw_response: r.raw_response,
          created_at: r.created_at
        }
      end
    }
  end
end
