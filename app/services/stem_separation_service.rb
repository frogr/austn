# Service for separating audio into stems using ComfyUI's Demucs node
class StemSeparationService
  AVAILABLE_MODELS = %w[
    htdemucs
    htdemucs_ft
  ].freeze

  DEFAULT_MODEL = "htdemucs".freeze
  COMPLETION_TIMEOUT = 900 # seconds; Demucs on a full song is slow

  STEM_NAMES = %w[vocals drums bass other].freeze

  # Output node IDs in the workflow
  STEM_OUTPUT_NODES = {
    "vocals" => "3",
    "drums" => "4",
    "bass" => "5",
    "other" => "6"
  }.freeze

  class StemSeparationError < StandardError; end

  # @param audio_path [String] the input audio on disk
  # @return [Hash{String => String}] base64-encoded FLAC per stem name
  def self.separate_stems(audio_path, model: DEFAULT_MODEL)
    validate_model!(model)

    workflow = ComfyuiClient.load_workflow("AUSTNNETSTEMSSPLIT.json")
    workflow["1"]["inputs"]["audio"] = ComfyuiClient.upload_file(audio_path)["name"]
    workflow["2"]["inputs"]["model"] = model

    session_id = SecureRandom.hex(4)
    STEM_OUTPUT_NODES.each do |stem_name, node_id|
      workflow[node_id]["inputs"]["filename_prefix"] = "stems_#{stem_name}_#{session_id}"
    end

    prompt_id = ComfyuiClient.queue_prompt(workflow)
    outputs = ComfyuiClient.wait_for_completion(prompt_id, timeout: COMPLETION_TIMEOUT)

    stems = STEM_OUTPUT_NODES.each_with_object({}) do |(stem_name, node_id), result|
      # SaveAudio reports files under "audio"; some node versions use "files".
      file = outputs.dig(node_id, "audio")&.first || outputs.dig(node_id, "files")&.first
      next Rails.logger.warn("No output for stem #{stem_name}") unless file

      audio = ComfyuiClient.get_output_file(file["filename"], subfolder: file["subfolder"].to_s)
      result[stem_name] = Base64.strict_encode64(audio)
    end

    raise StemSeparationError, "No stem outputs returned from ComfyUI" if stems.empty?

    stems
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
end
