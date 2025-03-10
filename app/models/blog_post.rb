class BlogPost < ApplicationRecord
  validates :title, presence: true
  validates :content, presence: true
  validates :slug, presence: true, uniqueness: true
  
  before_validation :generate_slug, on: :create
  
  private
  
  def generate_slug
    self.slug ||= title.parameterize if title.present?
  end
end