require "test_helper"

class GpuHealthControllerTest < ActionDispatch::IntegrationTest
  setup do
    GpuHealthStatus.for_service("chat").mark_offline!("Failed to open TCP connection to 10.0.0.1:1234")
  end

  test "lists every tool without internal error details" do
    get "/gpu_health"

    assert_response :success
    assert_equal GpuHealthStatus::SERVICES.sort, response.parsed_body.keys.sort
    assert_not_includes response.body, "10.0.0.1"
    assert_not_includes response.body, "error_message"
  end

  test "shows one tool without internal error details" do
    get "/gpu_health/chat"

    assert_response :success
    assert_equal false, response.parsed_body["online"]
    assert_not_includes response.body, "10.0.0.1"
  end

  test "unknown tools are not found" do
    get "/gpu_health/video"

    assert_response :not_found
  end

  test "probing on demand is admin-only" do
    post "/gpu_health/check", as: :json

    assert_response :unauthorized
  end

  test "an admin can probe on demand" do
    sign_in_as_admin

    with_env("LMSTUDIO_URL" => nil) do
      post "/gpu_health/check/chat"
    end

    assert_response :success
    assert_equal false, response.parsed_body["online"]
  end
end
