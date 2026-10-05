require "test_helper"

class SidekiqWebTest < ActionDispatch::IntegrationTest
  test "is not routed for visitors" do
    get "/sidekiq"

    assert_response :not_found
  end

  test "is available to a signed-in admin" do
    sign_in_as_admin
    get "/sidekiq"

    assert_response :success
  end
end
