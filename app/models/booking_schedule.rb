# The open booking slots: generated from the active weekly AvailabilityRules
# plus any one-off Availability rows, minus slots that have started or are
# fully booked. Visitors can book up to WINDOW ahead.
class BookingSchedule
  WINDOW = 8.weeks

  def initialize(now: Time.current)
    @now = now
  end

  # @return [Array<BookingSlot>] sorted by start time
  def open_slots(dates)
    dates = bookable(dates)
    return [] if dates.none?

    booked = booked_counts(dates)
    candidate_slots(dates).select do |slot|
      slot.starts_at > @now && booked.fetch([ slot.date, slot.start_label ], 0) < slot.capacity
    end
  end

  def open_slots_on(date)
    open_slots(date..date)
  end

  # @param start_label [String] wall-clock start, e.g. "14:30"
  def open_slot(date, start_label)
    open_slots_on(date).find { |slot| slot.start_label == start_label }
  end

  def open_dates(dates)
    open_slots(dates).map(&:date).uniq
  end

  def any_open?
    open_slots(today..last_bookable_date).any?
  end

  private

  def today
    @now.to_date
  end

  def last_bookable_date
    (@now + WINDOW).to_date
  end

  def bookable(dates)
    [ dates.begin, today ].max..[ dates.end, last_bookable_date ].min
  end

  # A rule and a one-off availability can offer the same start time; they
  # are one slot, and the one-off availability's details win.
  def candidate_slots(dates)
    (rule_slots(dates) + availability_slots(dates))
      .group_by(&:starts_at)
      .map { |_starts_at, slots| slots.find(&:availability_id) || slots.first }
      .sort_by(&:starts_at)
  end

  def rule_slots(dates)
    rules_by_weekday = AvailabilityRule.active.group_by(&:weekday)
    dates.flat_map do |date|
      rules_by_weekday.fetch(date.wday, []).flat_map { |rule| rule.slots_on(date) }
    end
  end

  def availability_slots(dates)
    Availability.active.where(date: dates).flat_map { |availability| availability.slots_on(availability.date) }
  end

  # @return [Hash{[Date, String] => Integer}] confirmed bookings per date and start time
  def booked_counts(dates)
    Booking.confirmed.where(booked_date: dates).map { |booking| [ booking.booked_date, booking.start_time.strftime("%H:%M") ] }.tally
  end
end
