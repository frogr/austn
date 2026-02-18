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
end
