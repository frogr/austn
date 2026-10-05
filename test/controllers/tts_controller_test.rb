require "test_helper"

class TtsControllerTest < ActionDispatch::IntegrationTest
  test "the TTS page does not list other people's shared clips" do
    share = TtsShare.create!(audio_data: Base64.strict_encode64("RIFF"), text: "a private message for a friend")

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
end
