class ReviewJob < ApplicationJob
  queue_as :default

  def perform(review_id)
    review = Review.find(review_id)
    review.update!(status: "reviewing")

    pipeline_config = Harness.configuration.dup
    pipeline_config.on_section_complete = build_callback(review)

    pipeline = Harness::Review::Pipeline.new(config: pipeline_config)
    pipeline.call(pr_url: review.pr_url)

    review.update!(status: "complete")
  rescue StandardError => e
    review&.update!(status: "failed")
    Rails.logger.error("Review #{review_id} failed: #{e.message}")
    raise
  end

  private

  def build_callback(review)
    lambda do |file:, findings:|
      section = review.review_sections.create!(
        filename: file.filename,
        language: file.language,
        walkthrough: "",
        findings: findings.map { |f| finding_to_hash(f) },
        status: "complete"
      )
      ActionCable.server.broadcast("review_#{review.id}", {
        type: "section_complete",
        section: section.as_json
      })
    end
  end

  def finding_to_hash(finding)
    {
      severity: finding.severity,
      title: finding.title,
      explanation: finding.explanation,
      file: finding.file,
      line_range: finding.line_range
    }
  end
end
