class TtsShare < ApplicationRecord
  EXPIRATION_DAYS = 7

  before_create :generate_token
  before_create :set_expiration

  validates :audio_data, presence: true
  validates :text, presence: true

  scope :active, -> { where("expires_at > ?", Time.current) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }

  def expired?
    expires_at <= Time.current
  end

  def self.cleanup_expired!
    expired.delete_all
  end

  private

  def generate_token
    self.token ||= SecureRandom.urlsafe_base64(16)
  end

  def set_expiration
    self.expires_at ||= EXPIRATION_DAYS.days.from_now
  end
end
