require "test_helper"

class MusicServiceTest < ActiveSupport::TestCase
  test "clamps duration, steps and guidance before queueing" do
    queued = nil
    workflow = { "1" => { "class_type" => "GenerationParameters", "inputs" => {} } }
    outputs = { "9" => { "audio" => [ { "filename" => "song.flac" } ] } }
    timeout_used = nil

    ComfyuiClient.stub(:load_workflow, workflow) do
      ComfyuiClient.stub(:queue_prompt, ->(w) { queued = w; "prompt-1" }) do
        ComfyuiClient.stub(:wait_for_completion, ->(_id, timeout:) { timeout_used = timeout; outputs }) do
          MusicService.generate(tags: "lo-fi", audio_duration: 100_000, infer_step: 5_000, guidance_scale: 99)
        end
      end
    end

    inputs = queued.dig("1", "inputs")
    assert_equal 240.0, inputs["audio_duration"]
    assert_equal 100, inputs["infer_step"]
    assert_equal 15.0, inputs["guidance_scale"]
    assert_equal MusicService::MAX_COMPLETION_TIMEOUT, timeout_used
  end
end
