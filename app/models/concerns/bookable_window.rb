# A daily window of bookable time, from start_time to end_time, cut into
# slots of slot_duration_minutes. Times are wall-clock times in the site's
# time zone, so a 10:00 start means 10:00 local on any date, across DST.
#
# Including models implement `slot_details`, returning the capacity,
# availability_id and title for their slots.
module BookableWindow
  extend ActiveSupport::Concern

  SLOT_DURATIONS = [ 15, 30, 45, 60 ].freeze

  included do
    validates :start_time, presence: true
    validates :end_time, presence: true
    validates :slot_duration_minutes, presence: true,
      inclusion: { in: SLOT_DURATIONS, message: "must be 15, 30, 45, or 60" }
    validate :end_time_after_start_time
  end

  # @return [Array<BookingSlot>]
  def slots_on(date)
    return [] unless start_time && end_time && slot_duration_minutes

    day = date.in_time_zone
    length = slot_duration_minutes.minutes
    slot_start = day.change(hour: start_time.hour, min: start_time.min)
    window_end = day.change(hour: end_time.hour, min: end_time.min)

    slots = []
    while slot_start + length <= window_end
      slots << BookingSlot.new(starts_at: slot_start, ends_at: slot_start + length, **slot_details)
      slot_start += length
    end
    slots
  end

  private

  def end_time_after_start_time
    return unless start_time && end_time

    if (end_time.hour * 60 + end_time.min) <= (start_time.hour * 60 + start_time.min)
      errors.add(:end_time, "must be after start time")
    end
  end
end
