class Review < ApplicationRecord
  PENDING   = "pending"
  REVIEWING = "reviewing"
  COMPLETE  = "complete"
  FAILED    = "failed"

  STATUSES = [PENDING, REVIEWING, COMPLETE, FAILED].freeze

  DECISIONS = %w[approve reject request_changes].freeze

  has_many :review_sections, dependent: :destroy
  has_many :harness_requests, dependent: :destroy

  validates :pr_url, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :decision, inclusion: { in: DECISIONS }, allow_nil: true

  def total_cost
    harness_requests.where(status: HarnessRequest::SUCCESS).sum(:estimated_cost)
  end

  def total_tokens
    harness_requests.where(status: HarnessRequest::SUCCESS).sum(:input_tokens) +
      harness_requests.where(status: HarnessRequest::SUCCESS).sum(:output_tokens)
  end
end
