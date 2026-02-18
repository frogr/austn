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
end
