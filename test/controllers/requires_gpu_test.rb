require "test_helper"

# Every endpoint that would put work on the GPU refuses it while the GPU is
# unavailable, and never enqueues a job.
class RequiresGpuTest < ActionDispatch::IntegrationTest
  GENERATION_ENDPOINTS = {
    "rembg" => "/rembg/generate",
    "stems" => "/stems/generate",
    "vtracer" => "/vtracer/generate",
    "model3d" => "/3d/generate",
    "music" => "/music/generate",
    "tts" => "/tts/generate",
    "images" => "/images/generate",
    "chat" => "/chat/async"
  }.freeze

  GENERATION_ENDPOINTS.each do |tool, path|
    test "#{path} answers 503 when the #{tool} backend is not configured" do
      with_env(Gpu::Backend::URL_ENV.fetch(Gpu::Backend.for_tool(tool)) => nil) do
        assert_no_enqueued_jobs { post path }
      end

      assert_response :service_unavailable
      assert_equal "gpu_offline", response.parsed_body["error_code"]
      assert_equal Gpu::PublicError::MESSAGES[:gpu_offline], response.parsed_body["error"]
    end

    test "#{path} answers 503 when the #{tool} backend is configured but marked offline" do
      stub_gpu_online(tool)
      GpuHealthStatus.for_service(tool).mark_offline!("probe failed")

      assert_no_enqueued_jobs { post path }

      assert_response :service_unavailable
    end
  end

  test "the image API refuses work while the GPU is offline" do
    with_env("TTS_API_KEY" => "test-key", "COMFYUI_URL" => nil) do
      assert_no_enqueued_jobs do
        post "/api/v1/images/generate_async", params: { prompt: "a lighthouse" }, headers: { "X-API-Key" => "test-key" }
      end
    end

    assert_response :service_unavailable
  end
end
