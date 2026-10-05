require "test_helper"

class Model3dControllerTest < ActionDispatch::IntegrationTest
  test "the 3D page has no public gallery of other people's uploads" do
    get "/3d"

    assert_response :success
    assert_no_match "Recent Models", response.body
  end
end
