class Story < ApplicationRecord
  PARAGRAPHS_PER_PAGE = 25
  CONTEXT_PARAGRAPHS = 7

  has_many :story_paragraphs, dependent: :destroy

  validates :title, presence: true
  validates :system_prompt, presence: true

  scope :active, -> { where(active: true) }

  def next_paragraph_number
    (story_paragraphs.maximum(:paragraph_number) || 0) + 1
  end

  def recent_paragraphs(n = CONTEXT_PARAGRAPHS)
    story_paragraphs.order(paragraph_number: :desc).limit(n).reverse
  end

  def paragraphs_page(page_number, per_page: PARAGRAPHS_PER_PAGE)
    offset = (page_number - 1) * per_page
    story_paragraphs.order(paragraph_number: :asc).offset(offset).limit(per_page)
  end

  def total_pages(per_page: PARAGRAPHS_PER_PAGE)
    [ (story_paragraphs.count.to_f / per_page).ceil, 1 ].max
  end

  def paragraph_count
    story_paragraphs.count
  end

  def started?
    story_paragraphs.exists?
  end

  def generate_next_paragraph!
    context = recent_paragraphs
    result = GroqService.generate_paragraph(system_prompt, context)

    story_paragraphs.create!(
      content: result[:content],
      paragraph_number: next_paragraph_number,
      token_count: result[:total_tokens],
      model_used: result[:model],
      metadata: {
        prompt_tokens: result[:prompt_tokens],
        completion_tokens: result[:completion_tokens],
        generated_at: Time.current
      }
    )
  end

  def as_export_json
    {
      title: title,
      created_at: created_at.iso8601,
      paragraph_count: paragraph_count,
      paragraphs: story_paragraphs.order(paragraph_number: :asc).map do |p|
        {
          number: p.paragraph_number,
          content: p.content,
          created_at: p.created_at.iso8601
        }
      end
    }
  end
end
