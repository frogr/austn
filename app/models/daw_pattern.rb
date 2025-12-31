class DawPattern < ApplicationRecord
  validates :name, presence: true
  validates :bpm, numericality: { in: 40..240 }, allow_nil: true
  validates :total_steps, numericality: { greater_than: 0 }, allow_nil: true
  validates :steps_per_measure, numericality: { greater_than: 0 }, allow_nil: true

  scope :templates, -> { where(is_template: true) }
  scope :user_patterns, -> { where(is_template: false) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_tag, ->(tag) { where("? = ANY(tags)", tag) }
  scope :search, ->(query) { where("name ILIKE ?", "%#{query}%") }

  def track_count
    data["tracks"]&.size || 0
  end

  def duration_seconds
    return 0 unless bpm && total_steps && steps_per_measure
    (total_steps.to_f / steps_per_measure) * 4 * (60.0 / bpm)
  end

  def as_json(options = {})
    super(options).merge(
      "trackCount" => track_count,
      "durationSeconds" => duration_seconds.round(2)
    )
  end
end
