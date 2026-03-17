class ReviewSection < ApplicationRecord
  PENDING   = "pending"
  REVIEWING = "reviewing"
  COMPLETE  = "complete"

  STATUSES = [ PENDING, REVIEWING, COMPLETE ].freeze

  belongs_to :review

  validates :filename, presence: true
  validates :status, inclusion: { in: STATUSES }
end
