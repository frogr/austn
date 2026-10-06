# A short piece Claude writes for the Claude Corner page. New entries are
# drafted by ClaudeCornerDraftJob and stay unpublished until Austin
# publishes them from the admin.
class ClaudeCornerEntry < ApplicationRecord
  TYPES = %w[musing found_thing tiny_creation conversation_starter recommendation code_sketch].freeze

  validates :slug, presence: true, uniqueness: true
  validates :entry_type, inclusion: { in: TYPES }
  validates :title, presence: true
  validates :content, presence: true

  before_validation :assign_slug, on: :create

  scope :published, -> { where.not(published_at: nil) }
  scope :drafts, -> { where(published_at: nil) }
  scope :newest_first, -> { order(Arel.sql("COALESCE(published_at, created_at) DESC")) }

  def published?
    published_at.present?
  end

  def publish!
    update!(published_at: Time.current)
  end

  def unpublish!
    update!(published_at: nil)
  end

  # The shape ClaudeCorner.jsx renders.
  def as_props
    {
      id: slug,
      type: entry_type,
      title: title,
      content: content,
      tags: tags,
      mood: mood,
      created_at: (published_at || created_at).iso8601
    }
  end

  private

  def assign_slug
    return if slug.present? || title.blank?

    base = title.parameterize.first(80)
    self.slug = self.class.exists?(slug: base) ? "#{base}-#{SecureRandom.hex(3)}" : base
  end
end
