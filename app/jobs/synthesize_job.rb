class SynthesizeJob < ApplicationJob
  queue_as :default

  def perform(review_id)
    review = Review.includes(:review_sections).find(review_id)
    findings = build_findings(review)
    human_comments = collect_comments(review)

    config = Harness.configuration
    llm = Harness::LLM::AnthropicClient.new(
      api_key: config.api_key,
      model: config.model,
      max_tokens: config.max_tokens_per_call
    )

    result = Harness::Review::Synthesis.new(llm_client: llm)
      .call(findings: findings, human_comments: human_comments)

    review.update!(synthesis_result: result)
    ActionCable.server.broadcast("#{ReviewChannel::STREAM_PREFIX}#{review.id}", {
      type: "synthesis_complete",
      synthesis: result
    })
  end

  private

  def build_findings(review)
    review.review_sections.flat_map do |section|
      (section.findings || []).map do |f|
        Harness::Review::Finding.new(
          severity: f["severity"].to_sym,
          title: f["title"],
          explanation: f["explanation"],
          file: f["file"],
          line_range: f["line_range"]
        )
      end
    end
  end

  def collect_comments(review)
    review.review_sections.flat_map do |section|
      (section.human_comments || []).map { |c| c["text"] }
    end
  end
end
