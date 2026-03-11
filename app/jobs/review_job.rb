class ReviewJob < ApplicationJob
  queue_as :default

  MAX_CONCURRENT_REVIEWS = 3
  MAX_REVIEWS_PER_HOUR = 10

  def perform(review_id)
    review = Review.find(review_id)

    if rate_limited?
      review.update!(status: Review::FAILED)
      Rails.logger.warn("Review #{review_id} rate-limited: too many recent reviews")
      return
    end

    if duplicate_in_progress?(review)
      review.update!(status: Review::FAILED)
      Rails.logger.warn("Review #{review_id} skipped: duplicate PR already in progress")
      return
    end

    review.update!(status: Review::REVIEWING)

    pipeline_config = Harness.configuration.dup
    pipeline_config.on_section_complete = build_callback(review)

    pipeline = Harness::Review::Pipeline.new(config: pipeline_config, review_id: review.id)
    pipeline.call(pr_url: review.pr_url)

    review.reload
    review.update!(
      status: Review::COMPLETE,
      total_findings: review.review_sections.sum { |s| (s.findings || []).size },
      red_flags: review.review_sections.sum { |s| (s.findings || []).count { |f| f["severity"] == "red_flag" } },
      warnings: review.review_sections.sum { |s| (s.findings || []).count { |f| f["severity"] == "warning" } }
    )
  rescue StandardError => e
    review&.update!(status: Review::FAILED)
    Rails.logger.error("Review #{review_id} failed: #{e.message}")
    raise
  end

  private

  def rate_limited?
    recent_count = Review.where("created_at > ?", 1.hour.ago)
                         .where.not(status: Review::FAILED)
                         .count
    recent_count >= MAX_REVIEWS_PER_HOUR
  end

  def duplicate_in_progress?(review)
    Review.where(pr_url: review.pr_url, status: Review::REVIEWING)
          .where.not(id: review.id)
          .exists?
  end

  def build_callback(review)
    lambda do |file:, findings:|
      section = review.review_sections.create!(
        filename: file.filename,
        language: file.language,
        patch_text: file.patch_text,
        walkthrough: "",
        findings: findings.map { |f| finding_to_hash(f) },
        status: ReviewSection::COMPLETE
      )
      broadcast(review.id, type: "section_complete", section: section.as_json)
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

  def broadcast(review_id, **payload)
    ActionCable.server.broadcast("#{ReviewChannel::STREAM_PREFIX}#{review_id}", payload)
  end
end
