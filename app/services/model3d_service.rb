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
    temp_file = create_temp_file(image_file)

    begin
      upload_result = ComfyuiClient.upload_file(temp_file.path)
      uploaded_filename = upload_result["name"]

      # Generate unique prefix for this job
      unique_prefix = "model3d_#{SecureRandom.hex(8)}"

      workflow = ComfyuiClient.load_workflow(WORKFLOW_NAME)
      workflow["1"]["inputs"]["image"] = uploaded_filename

      # Set unique filename prefix in node 6 (Hy3D21ExportMesh)
      workflow["6"]["inputs"]["filename_prefix"] = unique_prefix

      prompt_id = ComfyuiClient.queue_prompt(workflow)
      Rails.logger.info "Queued 3D generation with prompt_id: #{prompt_id}, prefix: #{unique_prefix}"

      ComfyuiClient.wait_for_completion(prompt_id, timeout: GENERATION_TIMEOUT)

      # We know the exact filename now
      glb_filename = "#{unique_prefix}_00001_.glb"

      Rails.logger.info "3D model generated: #{glb_filename}"

      glb_data = ComfyuiClient.get_output_file(
        glb_filename,
        subfolder: "",
        type: "output"
      )

      {
        glb_data: glb_data,
        filename: glb_filename
      }

    ensure
      temp_file.close
      temp_file.unlink
    end

  rescue ComfyuiClient::ComfyuiError => e
    raise Model3dError, e.message
  end

  private

  def self.create_temp_file(uploaded_file)
    extension = File.extname(uploaded_file.original_filename).presence || ".png"
    temp_file = Tempfile.new([ "model3d_input", extension ])
    temp_file.binmode
    temp_file.write(uploaded_file.read)
    temp_file.rewind
    uploaded_file.rewind if uploaded_file.respond_to?(:rewind)
    temp_file
  end
end
