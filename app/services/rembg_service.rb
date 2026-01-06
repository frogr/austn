require "tempfile"

# Service for removing backgrounds from images using ComfyUI's rembg node
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

  class RembgError < StandardError; end

  # Remove background from an image
  # @param image_file [ActionDispatch::Http::UploadedFile] The uploaded image
  # @param model [String] The rembg model to use
  # @return [String] Base64-encoded PNG with transparent background
  def self.remove_background(image_file, model: DEFAULT_MODEL)
    validate_model!(model)

    # Save uploaded file to temp location
    temp_file = create_temp_file(image_file)

    begin
      # Upload to ComfyUI
      upload_result = ComfyuiClient.upload_file(temp_file.path)
      uploaded_filename = upload_result["name"]

      Rails.logger.info "Uploaded image for rembg: #{uploaded_filename}"

      # Load and modify workflow
      workflow = ComfyuiClient.load_workflow("AUSTNNETREMBG.json")

      # Update input image (node 1)
      workflow["1"]["inputs"]["image"] = uploaded_filename

      # Update model (node 2)
      workflow["2"]["inputs"]["model"] = model

      # Generate unique output prefix
      output_prefix = "rembg_#{SecureRandom.hex(4)}"
      workflow["3"]["inputs"]["filename_prefix"] = output_prefix

      # Queue the workflow
      prompt_id = ComfyuiClient.queue_prompt(workflow)

      # Wait for completion (30s timeout for image processing)
      outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: 30, output_node_id: "3")

      # Get the output image
      if outputs && outputs["images"]&.any?
        image_info = outputs["images"].first
        filename = image_info["filename"]
        subfolder = image_info["subfolder"] || ""

        Rails.logger.info "Rembg output ready: #{filename}"

        # Fetch and encode the image
        image_data = ComfyuiClient.get_output_file(filename, subfolder: subfolder)
        Base64.strict_encode64(image_data)
      else
        raise RembgError, "No output image returned from ComfyUI"
      end

    ensure
      temp_file.close
      temp_file.unlink
    end

  rescue ComfyuiClient::ComfyuiError => e
    raise RembgError, e.message
  end

  # Get list of available models
  def self.available_models
    AVAILABLE_MODELS
  end

  private

  def self.validate_model!(model)
    unless AVAILABLE_MODELS.include?(model)
      raise RembgError, "Invalid model: #{model}. Available: #{AVAILABLE_MODELS.join(', ')}"
    end
  end

  def self.create_temp_file(uploaded_file)
    extension = File.extname(uploaded_file.original_filename).presence || ".png"
    temp_file = Tempfile.new([ "rembg_input", extension ])
    temp_file.binmode
    temp_file.write(uploaded_file.read)
    temp_file.rewind
    uploaded_file.rewind if uploaded_file.respond_to?(:rewind)
    temp_file
  end
end
