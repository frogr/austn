require "test_helper"

class ImageGenerationServiceTest < ActiveSupport::TestCase
  test "queues the workflow on ComfyUI and returns every image in the batch as base64" do
    queued_workflow = nil
    outputs = { "images" => [ { "filename" => "a.png", "subfolder" => "" }, { "filename" => "b.png", "subfolder" => "" } ] }

    ComfyuiClient.stub(:queue_prompt, ->(workflow) { queued_workflow = workflow; "prompt-1" }) do
      ComfyuiClient.stub(:wait_for_completion, outputs) do
        ComfyuiClient.stub(:get_output_file, ->(filename, **) { "png:#{filename}" }) do
          images = ImageGenerationService.generate("a lighthouse", seed: 7, image_size: 256, batch_size: 2)

          assert_equal [ Base64.strict_encode64("png:a.png"), Base64.strict_encode64("png:b.png") ], images
        end
      end
    end

    assert_equal "a lighthouse", queued_workflow.dig("5", "inputs", "text")
    assert_equal 7, queued_workflow.dig("3", "inputs", "seed")
    assert_equal({ "width" => 256, "height" => 256, "batch_size" => 2 }, queued_workflow.dig("7", "inputs"))
  end

  test "raises when ComfyUI finishes without images" do
    ComfyuiClient.stub(:queue_prompt, "prompt-1") do
      ComfyuiClient.stub(:wait_for_completion, {}) do
        assert_raises(ComfyuiClient::ComfyuiError) { ImageGenerationService.generate("a lighthouse") }
      end
    end
  end
end
