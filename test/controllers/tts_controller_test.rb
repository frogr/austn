require "test_helper"

class TtsControllerTest < ActionDispatch::IntegrationTest
  test "the TTS page does not list other people's shared clips" do
    share = TtsShare.create!(audio_data: Base64.strict_encode64("RIFF"), text: "a private message for a friend")
    stub_gpu_online("tts")

    get "/tts"

    assert_response :success
    assert_not_includes response.body, share.text
    assert_not_includes response.body, share.token
  end

  test "a shared clip is still reachable by its token" do
    share = TtsShare.create!(audio_data: Base64.strict_encode64("RIFF"), text: "hello")

    get tts_share_path(share.token)

    assert_response :success
  end

  test "visitors cannot clone a voice from an uploaded clip" do
    stub_gpu_online("tts")

    assert_no_enqueued_jobs do
      post "/tts/generate", params: { text: "hello", voice_audio: Base64.strict_encode64("RIFF....WAVE") }
    end

    assert_response :forbidden
  end

  test "the admin can use a custom voice clip" do
    stub_gpu_online("tts")
    sign_in_as_admin

    assert_enqueued_jobs 1, only: TtsGenerationJob do
      post "/tts/generate", params: { text: "hello", voice_audio: Base64.strict_encode64("RIFF....WAVE") }
    end
  end

  test "visitors can still generate speech with a preset voice" do
    stub_gpu_online("tts")

    assert_enqueued_jobs 1, only: TtsGenerationJob do
      post "/tts/generate", params: { text: "hello", voice_preset: "stock/narrator" }
    end
  end

  test "text over the length limit is refused" do
    stub_gpu_online("tts")

    assert_no_enqueued_jobs do
      post "/tts/generate", params: { text: "a" * (TtsService::MAX_TEXT_LENGTH + 1) }
    end

    assert_response :unprocessable_entity
    assert_equal "invalid_input", response.parsed_body["error_code"]
  end
end
