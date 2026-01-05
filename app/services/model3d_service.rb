require "tempfile"

# Service for generating 3D models from images using ComfyUI's Hunyuan3D + UltraShape workflow
class Model3dService
  WORKFLOW_NAME = "AUSTNET3DMODEL.json"

  # Long timeout since 3D generation takes 1-2 minutes
  GENERATION_TIMEOUT = 300 # 5 minutes

  class Model3dError < StandardError; end

  # Generate a 3D model from an image
  # @param image_file [ActionDispatch::Http::UploadedFile] The uploaded image
  # @return [Hash] { glb_data: binary_data, filename: "model.glb" }
  def self.generate(image_file)
    # Save uploaded file to temp location
    temp_file = create_temp_file(image_file)

    begin
      # Upload to ComfyUI
      upload_result = ComfyuiClient.upload_file(temp_file.path)
      uploaded_filename = upload_result["name"]

      Rails.logger.info "Uploaded image for 3D generation: #{uploaded_filename}"

      # Load and modify workflow
      workflow = ComfyuiClient.load_workflow(WORKFLOW_NAME)

      # Update input image (node 1 - LoadImage)
      workflow["1"]["inputs"]["image"] = uploaded_filename

      # Queue the workflow
      prompt_id = ComfyuiClient.queue_prompt(workflow)

      Rails.logger.info "Queued 3D generation with prompt_id: #{prompt_id}"

      # Wait for completion (long timeout for 3D processing)
      outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: GENERATION_TIMEOUT)

      # Extract the GLB output
      glb_info = extract_glb_output(outputs)

      Rails.logger.info "3D model generated: #{glb_info[:filename]}"

      # Fetch the GLB file from ComfyUI
      glb_data = ComfyuiClient.get_output_file(
        glb_info[:filename],
        subfolder: glb_info[:subfolder],
        type: "output"
      )

      {
        glb_data: glb_data,
        filename: glb_info[:filename]
      }

    ensure
      temp_file.close
      temp_file.unlink
    end

  rescue ComfyuiClient::ComfyuiError => e
    raise Model3dError, e.message
  end

  private

  def self.extract_glb_output(outputs)
    # Look through all node outputs for GLB/GLTF files
    outputs.each do |node_id, node_output|
      # Check various possible output keys for 3D files
      %w[gltf_files mesh_files glb_files files].each do |key|
        if node_output[key].is_a?(Array) && node_output[key].any?
          file_info = node_output[key].first
          return {
            filename: file_info["filename"],
            subfolder: file_info["subfolder"] || ""
          }
        end
      end

      # Also check for direct filename output
      if node_output["filename"]
        return {
          filename: node_output["filename"],
          subfolder: node_output["subfolder"] || ""
        }
      end
    end

    raise Model3dError, "No GLB output found in workflow result. Check your workflow configuration."
  end

  def self.create_temp_file(uploaded_file)
    extension = File.extname(uploaded_file.original_filename).presence || ".png"
    temp_file = Tempfile.new(["model3d_input", extension])
    temp_file.binmode
    temp_file.write(uploaded_file.read)
    temp_file.rewind
    uploaded_file.rewind if uploaded_file.respond_to?(:rewind)
    temp_file
  end
end
