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
    slots = avail.slots_on(avail.date)
    assert_equal 4, slots.length
  end

  test "generates correct time slots for 60-minute duration" do
    avail = Availability.new(
      date: Date.current + 1.day,
      start_time: "09:00",
      end_time: "12:00",
      slot_duration_minutes: 60
    )
    slots = avail.slots_on(avail.date)
    assert_equal 3, slots.length
  end

  test "booked slots are not offered" do
    avail = availabilities(:today_afternoon)
    booked = bookings(:confirmed_booking).starts_at

    start_times = BookingSchedule.new.open_slots_on(avail.date).map(&:starts_at)

    assert_not_includes start_times, booked
    assert_includes start_times, booked + 30.minutes
  end

  test "slots carry the availability's details" do
    avail = availabilities(:next_week)

    slot = avail.slots_on(avail.date).first

    assert_equal avail.id, slot.availability_id
    assert_equal 2, slot.capacity
    assert_equal avail.date, slot.date
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
