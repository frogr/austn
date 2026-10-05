require "test_helper"

class BookingsControllerTest < ActionDispatch::IntegrationTest
  test "GET /book shows calendar" do
    get book_path
    assert_response :success
    assert_select "h1", /Book a Time/
  end

  test "GET /book/:date shows time slots" do
    avail = availabilities(:today_afternoon)
    get book_date_path(date: avail.date.to_s)
    assert_response :success
  end

  test "GET /book/:date returns turbo frame for slot_picker" do
    avail = availabilities(:today_afternoon)
    get book_date_path(date: avail.date.to_s), headers: { "Turbo-Frame" => "slot_picker" }
    assert_response :success
    assert_match "turbo-frame", response.body
    assert_match "slot_picker", response.body
  end

  test "GET /book/:date with invalid date renders error in turbo frame" do
    get book_date_path(date: "invalid-date")
    assert_response :success
    assert_match "turbo-frame", response.body
    assert_match "Something went wrong", response.body
  end

  test "POST /bookings creates a booking" do
    avail = availabilities(:next_week)

    assert_difference "Booking.count", 1 do
      assert_enqueued_emails 2 do
        post bookings_path, params: {
          availability_id: avail.id,
          booked_date: avail.date.to_s,
          start_time: "09:00",
          end_time: "10:00",
          first_name: "Test",
          email: "test@example.com",
          phone_number: "5551234567",
          notes: "Test booking"
        }
      end
    end

    booking = Booking.last
    assert_equal "Test", booking.first_name
    assert_equal "test@example.com", booking.email
    assert_equal "confirmed", booking.status
    assert_redirected_to confirmation_booking_path(booking.confirmation_token)
  end

  test "POST /bookings fails with invalid data" do
    avail = availabilities(:next_week)

    assert_no_difference "Booking.count" do
      post bookings_path, params: {
        availability_id: avail.id,
        booked_date: avail.date.to_s,
        start_time: "09:00",
        end_time: "10:00",
        first_name: "",
        email: "invalid",
        phone_number: ""
      }
    end
    assert_response :unprocessable_entity
  end

  test "GET /bookings/:token/confirmation shows booking details" do
    booking = bookings(:confirmed_booking)
    get confirmation_booking_path(booking.confirmation_token)
    assert_response :success
    assert_select "h1", /You're Booked/
  end

  test "GET /bookings/:token/cancel_confirm shows cancel confirmation" do
    booking = bookings(:confirmed_booking)
    get cancel_confirm_booking_path(booking.confirmation_token)
    assert_response :success
    assert_select "h1", /Cancel Booking/
  end

  test "DELETE /bookings/:token/cancel cancels the booking" do
    booking = bookings(:confirmed_booking)

    assert_enqueued_emails 2 do
      delete cancel_booking_path(booking.confirmation_token)
    end

    booking.reload
    assert_equal "cancelled", booking.status
    assert booking.cancelled_at.present?
    assert_redirected_to book_path
  end

  test "cannot cancel already cancelled booking" do
    booking = bookings(:cancelled_booking)
    delete cancel_booking_path(booking.confirmation_token)
    assert_redirected_to book_path
    follow_redirect!
    assert_match "already been cancelled", response.body
  end

  test "GET /book says how to get in touch when nothing is open" do
    Booking.delete_all
    Availability.delete_all

    get book_path

    assert_response :success
    assert_match "No open times right now. Email", response.body
    assert_select "a[href='mailto:hi@austn.net']"
  end

  test "GET /book shows days opened by weekly rules" do
    travel_to Time.zone.local(2026, 10, 9, 9, 0) do
      AvailabilityRule.create!(weekday: 1, start_time: "10:00", end_time: "12:00", slot_duration_minutes: 30)

      get book_path(month: "2026-10")

      assert_select "a[href='#{book_date_path(date: '2026-10-12')}']"
      assert_no_match "No open times right now", response.body
    end
  end

  test "GET /book with a malformed month falls back to this month" do
    get book_path(month: "garbage")

    assert_response :success
    assert_match Date.current.strftime("%B %Y"), response.body
  end

  test "POST /bookings books a rule-generated slot" do
    travel_to Time.zone.local(2026, 10, 9, 9, 0) do
      AvailabilityRule.create!(weekday: 1, start_time: "10:00", end_time: "12:00", slot_duration_minutes: 30)

      assert_difference "Booking.count", 1 do
        post bookings_path, params: { booked_date: "2026-10-12", start_time: "10:30", first_name: "Ada",
                                      email: "ada@example.com", phone_number: "5551234567" }
      end
      assert_redirected_to confirmation_booking_path(Booking.last.confirmation_token)
    end
  end

  test "POST /bookings rejects a time outside the open slots" do
    avail = availabilities(:next_week)

    assert_no_difference "Booking.count" do
      post bookings_path, params: { availability_id: avail.id, booked_date: avail.date.to_s, start_time: "03:07",
                                    end_time: "11:07", first_name: "Mallory", email: "m@example.com",
                                    phone_number: "5550000000" }
    end
    assert_response :unprocessable_entity
    assert_match "no longer available", response.body
  end
end
