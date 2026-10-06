require "test_helper"

class BookingNotificationsChannelTest < ActionCable::Channel::TestCase
  test "streams booking notifications to the admin" do
    stub_connection admin: true
    subscribe

    assert subscription.confirmed?
    assert_has_stream "booking_notifications"
  end

  test "rejects visitors" do
    stub_connection admin: false
    subscribe

    assert subscription.rejected?
  end
end
