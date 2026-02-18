require "test_helper"

class AvailabilityTest < ActiveSupport::TestCase
  test "valid availability" do
    avail = Availability.new(
      date: Date.current + 1.day,
      start_time: "14:00",
      end_time: "17:00",
      slot_duration_minutes: 30,
      is_active: true,
      max_bookings_per_slot: 1
    )
    assert avail.valid?
  end

  test "requires date" do
    avail = Availability.new(start_time: "14:00", end_time: "17:00", slot_duration_minutes: 30)
    assert_not avail.valid?
    assert_includes avail.errors[:date], "can't be blank"
  end

  test "end time must be after start time" do
    avail = Availability.new(
      date: Date.current + 1.day,
      start_time: "17:00",
      end_time: "14:00",
      slot_duration_minutes: 30
    )
    assert_not avail.valid?
    assert_includes avail.errors[:end_time], "must be after start time"
  end

  test "slot_duration_minutes must be valid" do
    avail = Availability.new(
      date: Date.current + 1.day,
      start_time: "14:00",
      end_time: "17:00",
      slot_duration_minutes: 20
    )
    assert_not avail.valid?
    assert_includes avail.errors[:slot_duration_minutes], "must be 15, 30, 45, or 60"
  end

  test "generates correct time slots for 30-minute duration" do
    avail = Availability.new(
      date: Date.current + 1.day,
      start_time: "14:00",
      end_time: "16:00",
      slot_duration_minutes: 30
    )
    slots = avail.time_slots
    assert_equal 4, slots.length
  end

  test "generates correct time slots for 60-minute duration" do
    avail = Availability.new(
      date: Date.current + 1.day,
      start_time: "09:00",
      end_time: "12:00",
      slot_duration_minutes: 60
    )
    slots = avail.time_slots
    assert_equal 3, slots.length
  end

  test "available_slots_for_date excludes booked slots" do
    avail = availabilities(:today_afternoon)
    # There's one confirmed booking at 14:00-14:30
    available = avail.available_slots_for_date(avail.date)
    start_times = available.map { |s| s[:start_time].strftime("%H:%M") }
    assert_not_includes start_times, "14:00"
    assert_includes start_times, "14:30"
  end

  test "scope active returns only active availabilities" do
    active_count = Availability.active.count
    total_count = Availability.count
    assert active_count < total_count
  end

  test "scope upcoming returns future dates" do
    Availability.upcoming.each do |avail|
      assert avail.date >= Date.current
    end
  end
end
