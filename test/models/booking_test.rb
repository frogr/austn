require "test_helper"

class BookingTest < ActiveSupport::TestCase
  test "valid booking" do
    avail = availabilities(:next_week)
    booking = Booking.new(
      availability: avail,
      booked_date: avail.date,
      start_time: "09:00",
      end_time: "10:00",
      first_name: "Alice",
      email: "alice@example.com",
      phone_number: "5551112222"
    )
    assert booking.valid?
  end

  test "generates confirmation token on create" do
    avail = availabilities(:next_week)
    booking = Booking.create!(
      availability: avail,
      booked_date: avail.date,
      start_time: "10:00",
      end_time: "11:00",
      first_name: "Alice",
      email: "alice@example.com",
      phone_number: "5551112222"
    )
    assert booking.confirmation_token.present?
    assert booking.confirmation_token.length >= 32
  end

  test "requires first_name" do
    booking = Booking.new(email: "test@example.com", phone_number: "5551112222")
    assert_not booking.valid?
    assert_includes booking.errors[:first_name], "can't be blank"
  end

  test "validates email format" do
    avail = availabilities(:next_week)
    booking = Booking.new(
      availability: avail,
      booked_date: avail.date,
      start_time: "09:00",
      end_time: "10:00",
      first_name: "Alice",
      email: "not-an-email",
      phone_number: "5551112222"
    )
    assert_not booking.valid?
    assert_includes booking.errors[:email], "must be a valid email address"
  end

  test "normalizes phone number" do
    avail = availabilities(:next_week)
    booking = Booking.new(
      availability: avail,
      booked_date: avail.date,
      start_time: "09:00",
      end_time: "10:00",
      first_name: "Alice",
      email: "alice@example.com",
      phone_number: "(555) 111-2222"
    )
    booking.valid?
    assert_equal "5551112222", booking.phone_number
  end

  test "prevents double booking when slot is full" do
    avail = availabilities(:today_afternoon)
    # There's already a confirmed booking for 14:00-14:30 on this availability
    # max_bookings_per_slot is 1, so this should fail
    booking = Booking.new(
      availability: avail,
      booked_date: avail.date,
      start_time: "14:00",
      end_time: "14:30",
      first_name: "Duplicate",
      email: "dup@example.com",
      phone_number: "5553334444"
    )
    assert_not booking.valid?
    assert_includes booking.errors[:base], "This time slot is no longer available"
  end

  test "allows booking when max_bookings_per_slot not reached" do
    avail = availabilities(:next_week) # max_bookings_per_slot: 2
    booking = Booking.new(
      availability: avail,
      booked_date: avail.date,
      start_time: "09:00",
      end_time: "10:00",
      first_name: "First",
      email: "first@example.com",
      phone_number: "5551111111"
    )
    assert booking.valid?
  end

  test "cancel! sets status and cancelled_at" do
    booking = bookings(:confirmed_booking)
    booking.cancel!
    assert_equal "cancelled", booking.status
    assert booking.cancelled_at.present?
  end

  test "complete! sets status to completed" do
    booking = bookings(:confirmed_booking)
    booking.complete!
    assert_equal "completed", booking.status
  end

  test "confirmation token is unique" do
    avail = availabilities(:next_week)
    booking1 = Booking.create!(
      availability: avail,
      booked_date: avail.date,
      start_time: "09:00",
      end_time: "10:00",
      first_name: "One",
      email: "one@example.com",
      phone_number: "5551111111"
    )
    booking2 = Booking.create!(
      availability: avail,
      booked_date: avail.date,
      start_time: "10:00",
      end_time: "11:00",
      first_name: "Two",
      email: "two@example.com",
      phone_number: "5552222222"
    )
    assert_not_equal booking1.confirmation_token, booking2.confirmation_token
  end

  test "formatted_date returns readable date" do
    booking = bookings(:confirmed_booking)
    assert_match(/\w+, \w+ \d+, \d{4}/, booking.formatted_date)
  end

  test "formatted_time_range returns time range with PST" do
    booking = bookings(:confirmed_booking)
    assert_match(/\d+:\d+ [AP]M - \d+:\d+ [AP]M PST/, booking.formatted_time_range)
  end

  test "status must be valid" do
    booking = bookings(:confirmed_booking)
    booking.status = "invalid"
    assert_not booking.valid?
  end

  test "scopes return correct results" do
    assert Booking.confirmed.all? { |b| b.status == "confirmed" }
    assert Booking.cancelled.all? { |b| b.status == "cancelled" }
  end

  test "rejects a time that isn't one of the generated slots" do
    avail = availabilities(:next_week)
    booking = Booking.new(availability: avail, booked_date: avail.date, start_time: "03:07", end_time: "11:07",
                          first_name: "Mallory", email: "m@example.com", phone_number: "5550000000")

    assert_not booking.valid?
    assert_includes booking.errors[:base], "This time slot is no longer available"
  end

  test "takes the end time and availability from the slot, not the request" do
    avail = availabilities(:next_week)
    booking = Booking.create!(booked_date: avail.date, start_time: "09:00", end_time: "17:00", availability_id: 0,
                              first_name: "Alice", email: "alice@example.com", phone_number: "5551112222")

    assert_equal "10:00", booking.end_time.strftime("%H:%M")
    assert_equal avail, booking.availability
  end

  test "books a slot generated by a weekly rule" do
    travel_to Time.zone.local(2026, 10, 9, 9, 0) do
      AvailabilityRule.create!(weekday: 1, start_time: "10:00", end_time: "12:00", slot_duration_minutes: 30)
      attributes = { booked_date: Date.new(2026, 10, 12), start_time: "10:30", first_name: "Ada",
                     email: "ada@example.com", phone_number: "5551234567" }

      first = Booking.reserve(attributes)
      second = Booking.reserve(attributes.merge(email: "grace@example.com"))

      assert first.persisted?
      assert_nil first.availability
      assert_equal "11:00", first.end_time.strftime("%H:%M")
      assert_not second.persisted?
      assert_includes second.errors[:base], "This time slot is no longer available"
    end
  end

  test "reserve holds a lock on the day until its transaction ends" do
    avail = availabilities(:next_week)

    Booking.transaction do
      Booking.reserve(booked_date: avail.date, start_time: "09:00", first_name: "Alice",
                      email: "alice@example.com", phone_number: "5551112222")

      held = Booking.connection.select_value(<<~SQL)
        SELECT count(*) FROM pg_locks
        WHERE locktype = 'advisory' AND pid = pg_backend_pid()
          AND classid = #{ApplicationRecord::ADVISORY_LOCK_NAMESPACES[:booking_slots]} AND objid = #{avail.date.jd}
      SQL
      assert_equal 1, held
    end
  end
end
