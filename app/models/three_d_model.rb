class ThreeDModel < ApplicationRecord
  EXPIRATION_HOURS = 24

  before_create :set_expiration

  validates :generation_id, presence: true, uniqueness: true

  scope :active, -> { where("expires_at > ?", Time.current) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }
  scope :recent, -> { order(created_at: :desc) }

  def expired?
    expires_at <= Time.current
  end

  def self.cleanup_expired!
    expired.delete_all
  end

  def glb_available?
    Model3dRedisService.new.glb_exists?(generation_id)
  end

  private

  def set_expiration
    self.expires_at ||= EXPIRATION_HOURS.hours.from_now
  end
end
