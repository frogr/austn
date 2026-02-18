require "test_helper"

class Admin::BookingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    post admin_login_path, params: {
      username: ENV.fetch("ADMIN_USER_NAME", "admin"),
      password: ENV.fetch("ADMIN_PASSWORD", "password")
    }
  end

  test "GET /admin/bookings lists bookings" do
    get admin_bookings_path
    assert_response :success
  end

  test "GET /admin/bookings with filter" do
    get admin_bookings_path(filter: "cancelled")
    assert_response :success
  end

  test "GET /admin/bookings/:id shows booking" do
    booking = bookings(:confirmed_booking)
    get admin_booking_path(booking)
    assert_response :success
  end

  test "PATCH /admin/bookings/:id with cancel action" do
    booking = bookings(:confirmed_booking)
    patch admin_booking_path(booking), params: { booking_action: "cancel" }
    booking.reload
    assert_equal "cancelled", booking.status
    assert_redirected_to admin_bookings_path
  end

  test "PATCH /admin/bookings/:id with complete action" do
    booking = bookings(:confirmed_booking)
    patch admin_booking_path(booking), params: { booking_action: "complete" }
    booking.reload
    assert_equal "completed", booking.status
    assert_redirected_to admin_bookings_path
  end
end
