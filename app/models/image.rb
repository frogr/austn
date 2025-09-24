class Image < ApplicationRecord
  has_one_attached :file

  validates :title, presence: true
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true

  scope :published, -> { where(published: true) }
  scope :ordered, -> { order(position: :asc, created_at: :desc) }

  before_create :set_position

  private

  def set_position
    self.position ||= Image.maximum(:position).to_i + 1
  end
end
