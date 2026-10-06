require "test_helper"

class ApplicationCable::ConnectionTest < ActionCable::Connection::TestCase
  test "identifies a signed-in admin" do
    connect session: { AdminSession::SESSION_KEY => 1.hour.from_now.to_i }

    assert connection.admin
  end

  test "lets visitors connect without admin rights" do
    connect

    assert_not connection.admin
  end

  test "treats an expired admin session as a visitor" do
    connect session: { AdminSession::SESSION_KEY => 1.minute.ago.to_i }

    assert_not connection.admin
  end
end
