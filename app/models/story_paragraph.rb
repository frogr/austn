class StoryParagraph < ApplicationRecord
  belongs_to :story

  validates :content, presence: true
  validates :paragraph_number, presence: true, uniqueness: { scope: :story_id }

  scope :ordered, -> { order(paragraph_number: :asc) }

  def formatted_timestamp
    created_at.strftime("%b %d, %Y %l:%M %p")
  end

  def as_json_for_api
    {
      id: id,
      number: paragraph_number,
      content: content,
      created_at: created_at.iso8601,
      formatted_time: formatted_timestamp
    }
  end
end
