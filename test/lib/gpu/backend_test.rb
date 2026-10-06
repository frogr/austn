require "test_helper"

class Gpu::BackendTest < ActiveSupport::TestCase
  test "reads backend URLs from ENV" do
    with_env("COMFYUI_URL" => "http://gpu-box:8188") do
      assert_equal "http://gpu-box:8188", Gpu::Backend.url(:comfyui)
      assert Gpu::Backend.configured?(:comfyui)
    end
  end

  test "an unset URL means the backend is offline, with no fallback host" do
    with_env("TTS_URL" => nil) do
      assert_nil Gpu::Backend.url(:tts)
      assert_not Gpu::Backend.configured?(:tts)
      assert_raises(Gpu::Offline) { Gpu::Backend.url!(:tts) }
    end
  end

  test "a blank URL counts as unset" do
    with_env("LMSTUDIO_URL" => "") do
      assert_not Gpu::Backend.configured?(:lmstudio)
    end
  end

  test "maps every tool to a known backend" do
    assert_equal Gpu::Backend::URL_ENV.keys.sort, Gpu::Backend::TOOLS.values.uniq.sort
  end
end
