class BlogPost < ApplicationRecord
  validates :title, presence: true
  validates :content, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, on: :create

  scope :published, -> { where.not(published_at: nil).where(published_at: ..Time.current) }
  scope :recent, -> { order(published_at: :desc) }

  # Plain-text excerpt for meta descriptions and the writing index.
  def excerpt(length: 160)
    text = content.gsub(/```.*?```/m, " ")
                  .gsub(/!\[[^\]]*\]\([^)]*\)/, " ")    # images
                  .gsub(/\[([^\]]*)\]\([^)]*\)/, '\\1') # links keep their text
    text = ActionController::Base.helpers.strip_tags(text).gsub(/[#*_>`\[\]]/, "").squish
    text.truncate(length, separator: " ")
  end

  def summary
    metadata.is_a?(Hash) ? metadata["summary"] : nil
  end

  private

  def generate_slug
    self.slug ||= title.parameterize if title.present?
  end
end
