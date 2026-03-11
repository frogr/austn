class ReviewSection < ApplicationRecord
  belongs_to :review

  validates :filename, presence: true
  validates :status, inclusion: { in: %w[pending reviewing complete] }
end
