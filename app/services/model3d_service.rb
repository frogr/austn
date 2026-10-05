# Service for generating 3D models from images using ComfyUI's Hunyuan3D + UltraShape workflow
class Model3dService
  WORKFLOW_NAME = "AUSTNET3DMODEL.json"

  # Long timeout since 3D generation takes 1-2 minutes
  GENERATION_TIMEOUT = 300 # 5 minutes

  class Model3dError < StandardError; end

  # @param image_path [String] the input image on disk
  # @return [Hash] { glb_data: binary String, filename: String }
  def self.generate(image_path)
    unique_prefix = "model3d_#{SecureRandom.hex(8)}"

    workflow = ComfyuiClient.load_workflow(WORKFLOW_NAME)
    workflow["1"]["inputs"]["image"] = ComfyuiClient.upload_file(image_path)["name"]
    workflow["6"]["inputs"]["filename_prefix"] = unique_prefix # Hy3D21ExportMesh

    prompt_id = ComfyuiClient.queue_prompt(workflow)
    ComfyuiClient.wait_for_completion(prompt_id, timeout: GENERATION_TIMEOUT)

    # The export node reports no outputs, but its filename is predictable.
    glb_filename = "#{unique_prefix}_00001_.glb"
    { glb_data: ComfyuiClient.get_output_file(glb_filename), filename: glb_filename }
  rescue ComfyuiClient::ComfyuiError => e
    raise Model3dError, e.message
  end
end
