require "test_helper"

# Failures on GPU tool endpoints reach visitors as a code and a plain
# sentence, never as exception text.
class GpuToolErrorsTest < ActionDispatch::IntegrationTest
  INTERNAL_DETAIL = "Error connecting to 10.0.0.1:6379".freeze

  test "a failure while queueing a generation is reported without internals" do
    stub_gpu_online("rembg")

    RembgJob.stub(:perform_later, ->(*) { raise Redis::CannotConnectError, INTERNAL_DETAIL }) do
      post "/rembg/generate", params: { image: fixture_file_upload("pixel.png", "image/png") }
    end

    assert_response :internal_server_error
    assert_equal "generation_failed", response.parsed_body["error_code"]
    assert_not_includes response.body, "10.0.0.1"
  end

  test "an offline GPU while fetching a finished song is reported as such" do
    redis_service = MusicRedisService.new
    generation_id = SecureRandom.uuid
    redis_service.store_music(generation_id, { filename: "song.flac", subfolder: "", type: "output" })

    ComfyuiClient.stub(:get_output_file, ->(*, **) { raise Gpu::Offline, INTERNAL_DETAIL }) do
      get "/music/#{generation_id}/result"
    end

    assert_response :service_unavailable
    assert_equal "gpu_offline", response.parsed_body["error_code"]
    assert_not_includes response.body, "10.0.0.1"
  ensure
    redis_service.delete_result(generation_id)
  end

  test "a failed generation's status carries only the public error" do
    redis_service = RembgRedisService.new
    generation_id = SecureRandom.uuid
    redis_service.store_status(generation_id, { status: "failed", **Gpu::PublicError.new(:timeout).to_h })

    get "/rembg/#{generation_id}/status"

    assert_equal({ "status" => "failed", "error_code" => "timeout", "error" => Gpu::PublicError::MESSAGES[:timeout] },
                 response.parsed_body)
  ensure
    redis_service.delete_result(generation_id)
  end
end
