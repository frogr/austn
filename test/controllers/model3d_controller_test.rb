require "test_helper"

class Model3dControllerTest < ActionDispatch::IntegrationTest
  test "the 3D page has no public gallery of other people's uploads" do
    stub_gpu_online("model3d")
    get "/3d"

    assert_response :success
    assert_no_match "Recent Models", response.body
  end

  test "while the GPU is offline the 3D page sends visitors to its write-up" do
    get "/3d"

    assert_redirected_to playground_item_path("image-to-3d")
  end
end
