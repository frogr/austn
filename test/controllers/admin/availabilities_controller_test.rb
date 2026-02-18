require "test_helper"

class Admin::AvailabilitiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    # Authenticate as admin
    post admin_login_path, params: {
      username: ENV.fetch("ADMIN_USER_NAME", "admin"),
      password: ENV.fetch("ADMIN_PASSWORD", "password")
    }
  end

  test "GET /admin/availabilities requires auth" do
    reset!
    get admin_availabilities_path
    assert_redirected_to admin_login_path
  end

  test "GET /admin/availabilities lists availabilities" do
    get admin_availabilities_path
    assert_response :success
  end

  test "GET /admin/availabilities/new shows form" do
    get new_admin_availability_path
    assert_response :success
  end

  test "POST /admin/availabilities creates availability" do
    assert_difference "Availability.count", 1 do
      post admin_availabilities_path, params: {
        availability: {
          date: (Date.current + 10.days).to_s,
          start_time: "14:00",
          end_time: "17:00",
          slot_duration_minutes: 30,
          is_active: true,
          max_bookings_per_slot: 1,
          title: "Test"
        }
      }
    end
    assert_redirected_to admin_availabilities_path
  end

  test "POST /admin/availabilities with repeat creates multiple" do
    assert_difference "Availability.count", 4 do
      post admin_availabilities_path, params: {
        availability: {
          date: (Date.current + 10.days).to_s,
          start_time: "14:00",
          end_time: "17:00",
          slot_duration_minutes: 30,
          is_active: true,
          max_bookings_per_slot: 1
        },
        repeat_weeks: 4
      }
    end
    assert_redirected_to admin_availabilities_path
  end

  test "DELETE /admin/availabilities/:id deletes availability without bookings" do
    avail = availabilities(:inactive)
    assert_difference "Availability.count", -1 do
      delete admin_availability_path(avail)
    end
    assert_redirected_to admin_availabilities_path
  end

  test "DELETE /admin/availabilities/:id rejects deletion with bookings" do
    avail = availabilities(:today_afternoon) # has confirmed_booking
    assert_no_difference "Availability.count" do
      delete admin_availability_path(avail)
    end
    assert_redirected_to admin_availabilities_path
    follow_redirect!
    assert_match "Cannot delete", response.body
  end
end
