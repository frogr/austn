class Review < ApplicationRecord
  has_many :review_sections, dependent: :destroy

  validates :pr_url, presence: true
  validates :status, inclusion: { in: %w[pending reviewing complete failed] }
end
