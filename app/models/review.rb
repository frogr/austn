class Review < ApplicationRecord
  PENDING   = "pending"
  REVIEWING = "reviewing"
  COMPLETE  = "complete"
  FAILED    = "failed"

  STATUSES = [ PENDING, REVIEWING, COMPLETE, FAILED ].freeze

  has_many :review_sections, dependent: :destroy

  validates :pr_url, presence: true
  validates :status, inclusion: { in: STATUSES }
end
