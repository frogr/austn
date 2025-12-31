class TtsBatch < ApplicationRecord
  has_many :tts_batch_items, -> { order(:position) }, dependent: :destroy

  validates :name, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :pending, -> { where(status: "pending") }
  scope :processing, -> { where(status: "processing") }
  scope :completed, -> { where(status: %w[completed completed_with_errors]) }

  def progress_percentage
    return 0 if total_items.zero?
    ((completed_items + failed_items) * 100.0 / total_items).round(1)
  end

  def processing?
    status == "processing"
  end

  def completed?
    status.in?(%w[completed completed_with_errors])
  end

  def pending_items
    tts_batch_items.where(status: "pending")
  end

  def next_pending_item
    pending_items.order(:position).first
  end
end
