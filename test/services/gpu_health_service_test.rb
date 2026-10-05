require "test_helper"

class GpuHealthServiceTest < ActiveSupport::TestCase
  test "records unconfigured backends as offline without making a request" do
    with_env("COMFYUI_URL" => nil, "TTS_URL" => nil, "LMSTUDIO_URL" => nil) do
      Net::HTTP.stub(:start, ->(*) { flunk "no request expected" }) do
        results = GpuHealthService.check_all

        assert_equal GpuHealthStatus::SERVICES.sort, results.keys.sort
        assert results.values.none?
      end
    end

    assert_equal "COMFYUI_URL is not set", GpuHealthStatus.for_service("stems").error_message
  end

  test "a reachable backend marks all of its tools online" do
    with_env("COMFYUI_URL" => "http://gpu-box:8188", "TTS_URL" => nil, "LMSTUDIO_URL" => nil) do
      ok = Net::HTTPOK.new("1.1", "200", "OK")
      http = Object.new
      http.define_singleton_method(:get) { |_path| ok }

      Net::HTTP.stub(:start, ->(*, **, &request) { request.call(http) }) do
        GpuHealthService.check_all
      end
    end

    %w[images rembg vtracer stems music model3d].each { |tool| assert GpuHealthStatus.online?(tool), tool }
    assert_not GpuHealthStatus.online?("tts")
  end

  test "an unreachable backend is recorded as offline" do
    with_env("TTS_URL" => "http://gpu-box:5000") do
      Net::HTTP.stub(:start, ->(*) { raise Errno::ECONNREFUSED }) do
        assert_not GpuHealthService.new.check("tts")
      end
    end

    assert_match "Gpu::Offline", GpuHealthStatus.for_service("tts").error_message
  end
end
