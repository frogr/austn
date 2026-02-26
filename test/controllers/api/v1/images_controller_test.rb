require "test_helper"

class Api::V1::ImagesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @api_key = "test-api-key-123"
    ENV["TTS_API_KEY"] = @api_key
    @headers = { "X-API-Key" => @api_key, "Content-Type" => "application/json" }
  end

  test "generate returns unauthorized without API key" do
    post "/api/v1/images/generate",
      params: { prompt: "a sunset" }.to_json,
      headers: { "Content-Type" => "application/json" }

    assert_response :unauthorized
    assert_equal "Unauthorized", response.parsed_body["error"]
  end

  test "generate returns unauthorized with wrong API key" do
    post "/api/v1/images/generate",
      params: { prompt: "a sunset" }.to_json,
      headers: { "X-API-Key" => "wrong-key", "Content-Type" => "application/json" }

    assert_response :unauthorized
  end

  test "generate requires prompt parameter" do
    post "/api/v1/images/generate",
      params: {}.to_json,
      headers: @headers

    assert_response :unprocessable_entity
    assert_equal "Prompt is required", response.parsed_body["error"]
  end

  test "generate_async requires prompt parameter" do
    post "/api/v1/images/generate_async",
      params: {}.to_json,
      headers: @headers

    assert_response :unprocessable_entity
    assert_equal "Prompt is required", response.parsed_body["error"]
  end

  test "generate_async queues job and returns generation ID" do
    assert_enqueued_with(job: ImageGenerationJob) do
      post "/api/v1/images/generate_async",
        params: { prompt: "a moody battlefield at sunset" }.to_json,
        headers: @headers
    end

    assert_response :accepted
    body = response.parsed_body
    assert_equal "queued", body["status"]
    assert body["generation_id"].present?
    assert body["status_url"].present?
    assert_includes body["status_url"], body["generation_id"]
  end

  test "generate_async passes options to job" do
    assert_enqueued_with(job: ImageGenerationJob) do
      post "/api/v1/images/generate_async",
        params: {
          prompt: "a sunset",
          negative_prompt: "blurry",
          width: 768,
          seed: 42
        }.to_json,
        headers: @headers
    end

    assert_response :accepted
  end

  test "status returns pending for unknown generation" do
    get "/api/v1/images/#{SecureRandom.uuid}/status",
      headers: @headers

    assert_response :success
    body = response.parsed_body
    assert_equal "pending", body["status"]
  end

  test "generate handles seed of -1 as random" do
    assert_enqueued_with(job: ImageGenerationJob) do
      post "/api/v1/images/generate_async",
        params: { prompt: "a sunset", seed: -1 }.to_json,
        headers: @headers
    end

    assert_response :accepted
  end
end
