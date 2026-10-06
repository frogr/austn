# Removes image backgrounds with ComfyUI's rembg node.
class RembgService
  AVAILABLE_MODELS = %w[
    u2net
    u2netp
    u2net_human_seg
    u2net_cloth_seg
    silueta
    isnet-general-use
    isnet-anime
  ].freeze

  DEFAULT_MODEL = "u2net".freeze
  WORKFLOW_NAME = "AUSTNNETREMBG.json".freeze
  TIMEOUT = 30 # seconds

  class RembgError < StandardError; end

  # @param image_path [String] the input image on disk
  # @return [String] base64-encoded PNG with a transparent background
  def self.remove_background(image_path, model: DEFAULT_MODEL)
    raise RembgError, "Invalid model: #{model}" unless AVAILABLE_MODELS.include?(model)

    workflow = ComfyuiClient.load_workflow(WORKFLOW_NAME)
    workflow["1"]["inputs"]["image"] = ComfyuiClient.upload_file(image_path)["name"]
    workflow["2"]["inputs"]["model"] = model
    workflow["3"]["inputs"]["filename_prefix"] = "rembg_#{SecureRandom.hex(4)}"

    prompt_id = ComfyuiClient.queue_prompt(workflow)
    outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: TIMEOUT, output_node_id: "3")

    image = outputs["images"]&.first
    raise RembgError, "No output image returned from ComfyUI" unless image

    Base64.strict_encode64(ComfyuiClient.get_output_file(image["filename"], subfolder: image["subfolder"].to_s))
  rescue ComfyuiClient::ComfyuiError => e
    raise RembgError, e.message
  end
end
