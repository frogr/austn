class TtsBatchItem < ApplicationRecord
  belongs_to :tts_batch

  validates :text, presence: true
  validates :position, presence: true

  scope :pending, -> { where(status: "pending") }
  scope :processing, -> { where(status: "processing") }
  scope :completed, -> { where(status: "completed") }
  scope :failed, -> { where(status: "failed") }

  def mark_processing!
    update!(status: "processing", started_at: Time.current)
  end

  def mark_completed!(audio_data:, duration:)
    update!(
      status: "completed",
      audio_data: audio_data,
      duration: duration,
      completed_at: Time.current
    )
  end

  def mark_failed!(error_message)
    update!(
      status: "failed",
      error_message: error_message,
      completed_at: Time.current
    )
  end
end
