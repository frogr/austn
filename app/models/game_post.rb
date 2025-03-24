class GamePost < ApplicationRecord
  validates :title, presence: true
  validates :description, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :image_url, presence: true
  validates :link, presence: true

  before_validation :generate_slug, on: :create

  private

  def generate_slug
    self.slug ||= title.parameterize if title.present?
  end
end