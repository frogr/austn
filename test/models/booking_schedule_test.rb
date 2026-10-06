require "test_helper"

class BookingScheduleTest < ActiveSupport::TestCase
  MONDAY = Date.new(2026, 10, 12)

  setup do
    # Only what each test creates, not the one-off availability fixtures.
    Booking.delete_all
    Availability.delete_all
    AvailabilityRule.create!(weekday: 1, start_time: "10:00", end_time: "12:00", slot_duration_minutes: 30)
    travel_to Time.zone.local(2026, 10, 9, 9, 0) # the Friday before
  end

  test "generates slots from rules on matching weekdays only" do
    schedule = BookingSchedule.new

    assert_equal %w[10:00 10:30 11:00 11:30], schedule.open_slots_on(MONDAY).map(&:start_label)
    assert_empty schedule.open_slots_on(MONDAY + 1.day)
  end

  test "ignores inactive rules" do
    AvailabilityRule.update_all(active: false)

    assert_empty BookingSchedule.new.open_slots_on(MONDAY)
  end

  test "drops slots that have already started" do
    travel_to MONDAY.in_time_zone.change(hour: 10, min: 45)

    assert_equal %w[11:00 11:30], BookingSchedule.new.open_slots_on(MONDAY).map(&:start_label)
  end

  test "drops booked rule slots" do
    book(MONDAY, "10:30")

    assert_equal %w[10:00 11:00 11:30], BookingSchedule.new.open_slots_on(MONDAY).map(&:start_label)
  end

  test "adds one-off availability and merges it with an overlapping rule" do
    Availability.create!(date: MONDAY, start_time: "11:30", end_time: "13:00", slot_duration_minutes: 30,
                         max_bookings_per_slot: 2, title: "Extra")

    slots = BookingSchedule.new.open_slots_on(MONDAY)

    assert_equal %w[10:00 10:30 11:00 11:30 12:00 12:30], slots.map(&:start_label)
    assert_equal "Extra", slots.find { |slot| slot.start_label == "11:30" }.title
  end

  test "only offers slots within the booking window" do
    far_monday = MONDAY + 10.weeks

    assert_empty BookingSchedule.new.open_slots_on(far_monday)
  end

  test "finds an open slot by start time" do
    schedule = BookingSchedule.new

    assert_equal "11:00", schedule.open_slot(MONDAY, "11:00").start_label
    assert_nil schedule.open_slot(MONDAY, "11:15")
    assert_nil schedule.open_slot(MONDAY, "03:07")
  end

  test "lists open dates and knows when nothing is open" do
    assert_includes BookingSchedule.new.open_dates(MONDAY.all_month), MONDAY
    assert BookingSchedule.new.any_open?

    AvailabilityRule.delete_all
    assert_not BookingSchedule.new.any_open?
  end

  private

  def book(date, start_time)
    Booking.reserve(booked_date: date, start_time: start_time, first_name: "Ada", email: "ada@example.com",
                    phone_number: "5551234567").tap { |booking| assert booking.persisted?, booking.errors.full_messages.to_sentence }
  end
end
