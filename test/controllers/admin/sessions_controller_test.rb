require "test_helper"

class Admin::SessionsControllerTest < ActionDispatch::IntegrationTest
  test "valid credentials sign in and redirect to the admin dashboard" do
    sign_in_as_admin

    assert_redirected_to admin_root_path
    follow_redirect!
    assert_response :success
  end

  test "returns to the page that required sign-in" do
    get admin_bookings_path
    assert_redirected_to admin_login_path

    sign_in_as_admin
    assert_redirected_to admin_bookings_path
  end

  test "invalid credentials are rejected" do
    post admin_login_path, params: { username: "admin", password: "wrong" }

    assert_response :unprocessable_entity
    get admin_root_path
    assert_redirected_to admin_login_path
  end

  test "signing in resets the session" do
    get book_path
    session_id_before = session.id

    sign_in_as_admin

    assert_not_equal session_id_before, session.id
  end

  test "a sign-in expires after 12 hours unless the device is remembered" do
    sign_in_as_admin(remember: false)

    travel AdminSession::TTL + 1.minute do
      get admin_root_path
      assert_redirected_to admin_login_path
    end
  end

  test "a remembered device stays signed in for 30 days" do
    sign_in_as_admin(remember: true)

    travel 29.days do
      get admin_root_path
      assert_response :success
    end

    travel AdminSession::REMEMBERED_TTL + 1.minute do
      get admin_root_path
      assert_redirected_to admin_login_path
    end
  end

  test "sign-in attempts are rate limited per IP" do
    10.times { post admin_login_path, params: { username: "admin", password: "wrong" } }
    assert_response :unprocessable_entity

    sign_in_as_admin

    assert_response :too_many_requests
    assert_match "Too many sign-in attempts", response.body
  end

  test "signing out ends the admin session" do
    sign_in_as_admin
    delete admin_logout_path

    get admin_root_path
    assert_redirected_to admin_login_path
  end

  test "admin JSON endpoints answer 401 instead of redirecting" do
    get review_path(reviews(:pending_review)), as: :json

    assert_response :unauthorized
  end
end
