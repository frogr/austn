require "tempfile"

# Service for separating audio into stems using ComfyUI's Demucs node
class StemSeparationService
  AVAILABLE_MODELS = %w[
    htdemucs
    htdemucs_ft
  ].freeze

  DEFAULT_MODEL = "htdemucs".freeze

  STEM_NAMES = %w[vocals drums bass other].freeze

  # Output node IDs in the workflow
  STEM_OUTPUT_NODES = {
    "vocals" => "3",
    "drums" => "4",
    "bass" => "5",
    "other" => "6"
  }.freeze

  class StemSeparationError < StandardError; end

  # Separate audio into stems
  # @param audio_file [ActionDispatch::Http::UploadedFile] The uploaded audio file
  # @param model [String] The Demucs model to use
  # @return [Hash] Hash with stem names as keys and base64-encoded audio as values
  def self.separate_stems(audio_file, model: DEFAULT_MODEL)
    validate_model!(model)

    # Save uploaded file to temp location
    temp_file = create_temp_file(audio_file)

    begin
      # Upload to ComfyUI (uses same upload endpoint for audio)
      upload_result = ComfyuiClient.upload_file(temp_file.path)
      uploaded_filename = upload_result["name"]

      Rails.logger.info "Uploaded audio for stem separation: #{uploaded_filename}"

      # Load and modify workflow
      workflow = ComfyuiClient.load_workflow("AUSTNNETSTEMSSPLIT.json")

      # Update input audio (node 1)
      workflow["1"]["inputs"]["audio"] = uploaded_filename

      # Update model (node 2)
      workflow["2"]["inputs"]["model"] = model

      # Generate unique output prefixes for each stem
      session_id = SecureRandom.hex(4)
      STEM_OUTPUT_NODES.each do |stem_name, node_id|
        workflow[node_id]["inputs"]["filename_prefix"] = "stems_#{stem_name}_#{session_id}"
      end

      # Queue the workflow
      prompt_id = ComfyuiClient.queue_prompt(workflow)
      Rails.logger.info "Queued stem separation prompt: #{prompt_id}"

      # Wait for completion (15 minutes timeout for audio processing)
      outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: 900)
      Rails.logger.info "Stem separation completed. Output nodes: #{outputs.keys.inspect}"

      # Collect all stem outputs
      stems = {}

      STEM_OUTPUT_NODES.each do |stem_name, node_id|
        node_output = outputs[node_id]
        Rails.logger.info "Processing stem #{stem_name} (node #{node_id}): #{node_output&.keys || 'nil'}"

        if node_output && node_output["audio"]&.any?
          audio_info = node_output["audio"].first
          filename = audio_info["filename"]
          subfolder = audio_info["subfolder"] || ""

          Rails.logger.info "Fetching stem #{stem_name}: #{filename} (subfolder: #{subfolder.presence || 'none'})"

          # Fetch and encode the audio
          audio_data = ComfyuiClient.get_output_file(filename, subfolder: subfolder)
          Rails.logger.info "Downloaded stem #{stem_name}: #{audio_data.bytesize} bytes"
          stems[stem_name] = Base64.strict_encode64(audio_data)
        elsif node_output && node_output["files"]&.any?
          # Alternative output format
          file_info = node_output["files"].first
          filename = file_info["filename"]
          subfolder = file_info["subfolder"] || ""

          Rails.logger.info "Fetching stem #{stem_name} (files format): #{filename}"
          audio_data = ComfyuiClient.get_output_file(filename, subfolder: subfolder)
          Rails.logger.info "Downloaded stem #{stem_name}: #{audio_data.bytesize} bytes"
          stems[stem_name] = Base64.strict_encode64(audio_data)
        else
          Rails.logger.warn "No output for stem: #{stem_name}. Node output: #{node_output.inspect}"
        end
      end

      if stems.empty?
        raise StemSeparationError, "No stem outputs returned from ComfyUI"
      end

      stems

    ensure
      temp_file.close
      temp_file.unlink
    end

  rescue ComfyuiClient::ComfyuiError => e
    raise StemSeparationError, e.message
  end

  # Get list of available models
  def self.available_models
    AVAILABLE_MODELS
  end

  # Get list of stem names
  def self.stem_names
    STEM_NAMES
  end

  private

  def self.validate_model!(model)
    unless AVAILABLE_MODELS.include?(model)
      raise StemSeparationError, "Invalid model: #{model}. Available: #{AVAILABLE_MODELS.join(', ')}"
    end
  end

  def self.create_temp_file(uploaded_file)
    extension = File.extname(uploaded_file.original_filename).presence || ".mp3"
    temp_file = Tempfile.new(["stems_input", extension])
    temp_file.binmode
    temp_file.write(uploaded_file.read)
    temp_file.rewind
    uploaded_file.rewind if uploaded_file.respond_to?(:rewind)
    temp_file
  end
end
