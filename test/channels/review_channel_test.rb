require "test_helper"

class ReviewChannelTest < ActionCable::Channel::TestCase
  test "streams a review to the admin" do
    stub_connection admin: true
    subscribe review_id: 42

    assert_has_stream "review_42"
  end

  test "rejects visitors" do
    stub_connection admin: false
    subscribe review_id: 42

    assert subscription.rejected?
  end
end
