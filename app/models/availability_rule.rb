# A weekly window when people can book time, e.g. Mondays 11:00 to 17:00 in
# 30-minute slots. BookingSchedule turns active rules into slots on the fly.
class AvailabilityRule < ApplicationRecord
  include BookableWindow

  # Stored as plain wall-clock times, so they keep their meaning if the
  # site's time zone ever changes.
  self.skip_time_zone_conversion_for_attributes = %i[start_time end_time]

  validates :weekday, inclusion: { in: 0..6 }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(:weekday, :start_time) }

  # Monday to Friday, 11:00 to 17:00, 30-minute slots.
  def self.create_defaults!
    (1..5).each do |weekday|
      find_or_create_by!(weekday: weekday) do |rule|
        rule.start_time = "11:00"
        rule.end_time = "17:00"
        rule.slot_duration_minutes = 30
      end
    end
  end

  def weekday_name
    Date::DAYNAMES[weekday]
  end

  private

  def slot_details
    { capacity: 1, availability_id: nil, title: nil }
  end
end
