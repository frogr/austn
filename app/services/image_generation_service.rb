# Text-to-image generation with Stable Diffusion 1.5, run through ComfyUI.
class ImageGenerationService
  CHECKPOINT = "v1-5-pruned-emaonly-fp16.safetensors".freeze
  DEFAULT_NEGATIVE_PROMPT = "blurry, out of focus, low quality, pixelated, compression artifacts, jpeg artifacts".freeze
  OUTPUT_NODE_ID = "9".freeze
  TIMEOUT = 60 # seconds

  # @return [Array<String>] base64-encoded PNGs, one per image in the batch
  def self.generate(prompt, negative_prompt: nil, seed: nil, image_size: 512, batch_size: 1)
    workflow = build_workflow(
      prompt: prompt,
      negative_prompt: negative_prompt.presence || DEFAULT_NEGATIVE_PROMPT,
      seed: seed.presence || rand(1..1_000_000_000),
      image_size: image_size,
      batch_size: batch_size
    )

    prompt_id = ComfyuiClient.queue_prompt(workflow)
    outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: TIMEOUT, output_node_id: OUTPUT_NODE_ID)
    images = outputs["images"] || []
    raise ComfyuiClient::ComfyuiError, "No images returned from ComfyUI" if images.empty?

    images.map do |image|
      Base64.strict_encode64(ComfyuiClient.get_output_file(image["filename"], subfolder: image["subfolder"].to_s))
    end
  end

  def self.build_workflow(prompt:, negative_prompt:, seed:, image_size:, batch_size:)
    {
      "4" => { "class_type" => "CheckpointLoaderSimple", "inputs" => { "ckpt_name" => CHECKPOINT } },
      "5" => { "class_type" => "CLIPTextEncode", "inputs" => { "text" => prompt, "clip" => [ "4", 1 ] } },
      "6" => { "class_type" => "CLIPTextEncode", "inputs" => { "text" => negative_prompt, "clip" => [ "4", 1 ] } },
      "7" => {
        "class_type" => "EmptyLatentImage",
        "inputs" => { "width" => image_size, "height" => image_size, "batch_size" => batch_size }
      },
      "3" => {
        "class_type" => "KSampler",
        "inputs" => {
          "seed" => seed, "steps" => 20, "cfg" => 8.0, "sampler_name" => "euler", "scheduler" => "normal",
          "denoise" => 1.0, "model" => [ "4", 0 ], "positive" => [ "5", 0 ], "negative" => [ "6", 0 ],
          "latent_image" => [ "7", 0 ]
        }
      },
      "8" => { "class_type" => "VAEDecode", "inputs" => { "samples" => [ "3", 0 ], "vae" => [ "4", 2 ] } },
      OUTPUT_NODE_ID => {
        "class_type" => "SaveImage",
        "inputs" => { "filename_prefix" => "api_#{SecureRandom.hex(4)}", "images" => [ "8", 0 ] }
      }
    }
  end
  private_class_method :build_workflow
end
