# A one-off window of bookable time on a specific date, on top of the weekly
# AvailabilityRules (for example an extra Saturday morning).
class Availability < ApplicationRecord
  include BookableWindow

  has_many :bookings, dependent: :restrict_with_error

  validates :date, presence: true
  validates :max_bookings_per_slot, presence: true, numericality: { greater_than: 0 }
  validate :date_not_in_past, on: :create

  scope :active, -> { where(is_active: true) }
  scope :for_date, ->(date) { where(date: date) }
  scope :upcoming, -> { where("date >= ?", Date.current) }

  def has_bookings?
    bookings.where(status: "confirmed").exists?
  end

  private

  def slot_details
    { capacity: max_bookings_per_slot, availability_id: id, title: title }
  end

  def date_not_in_past
    return unless date.present?

    if date < Date.current
      errors.add(:date, "cannot be in the past")
    end
  end
end
