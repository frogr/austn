class HarnessRequest < ApplicationRecord
  PENDING = "pending"
  SUCCESS = "success"
  ERROR   = "error"

  TYPES = %w[triage section_review synthesis].freeze
  PROVIDERS = %w[openai anthropic].freeze

  belongs_to :review, optional: true

  validates :request_type, inclusion: { in: TYPES }
  validates :provider, inclusion: { in: PROVIDERS }
  validates :model, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :for_review, ->(review_id) { where(review_id: review_id) }

  # Cost per 1M tokens (gpt-4o-mini pricing as default)
  PRICING = {
    "gpt-4o-mini" => { input: 0.15, output: 0.60 },
    "gpt-4o" => { input: 2.50, output: 10.00 },
    "gpt-4-turbo" => { input: 10.00, output: 30.00 },
    "claude-sonnet-4-20250514" => { input: 3.00, output: 15.00 },
    "claude-haiku-4-20250414" => { input: 0.80, output: 4.00 }
  }.freeze

  def compute_cost
    pricing = PRICING[model] || PRICING["gpt-4o-mini"]
    input_cost = (input_tokens / 1_000_000.0) * pricing[:input]
    output_cost = (output_tokens / 1_000_000.0) * pricing[:output]
    input_cost + output_cost
  end

  def self.total_cost_for_review(review_id)
    for_review(review_id).where(status: SUCCESS).sum(:estimated_cost)
  end

  def self.total_tokens_for_review(review_id)
    for_review(review_id).where(status: SUCCESS).pluck(:input_tokens, :output_tokens).flatten.sum
  end
end
