require "test_helper"

class TtsBatchChannelTest < ActionCable::Channel::TestCase
  test "streams batch progress to the admin" do
    stub_connection admin: true
    subscribe batch_id: 7

    assert_has_stream "tts_batch_7"
  end

  test "rejects visitors" do
    stub_connection admin: false
    subscribe batch_id: 7

    assert subscription.rejected?
  end
end
