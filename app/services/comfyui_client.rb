require "httparty"
require "base64"

# Shared client for ComfyUI API interactions
# Handles file uploads, workflow queuing, and result fetching
class ComfyuiClient
  include HTTParty
  base_uri ENV["COMFYUI_URL"] || "http://100.68.94.33:8188"

  class ComfyuiError < StandardError; end

  # Upload a file to ComfyUI's input folder
  # @param file_path [String] Path to the local file
  # @param subfolder [String] Optional subfolder in ComfyUI's input directory
  # @return [Hash] Response with {name:, subfolder:, type:}
  def self.upload_file(file_path, subfolder: "")
    raise ComfyuiError, "File not found: #{file_path}" unless File.exist?(file_path)

    basename = File.basename(file_path)
    Rails.logger.info "Uploading file to ComfyUI: #{basename}"

    uri = URI("#{base_uri}/upload/image")
    request = Net::HTTP::Post.new(uri)

    # Build multipart form data
    form_data = [
      [ "image", File.open(file_path, "rb"), { filename: basename } ]
    ]
    form_data << [ "subfolder", subfolder ] if subfolder.present?

    request.set_form(form_data, "multipart/form-data")

    response = Net::HTTP.start(uri.hostname, uri.port) do |http|
      http.read_timeout = 30
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise ComfyuiError, "Upload failed: #{response.code} - #{response.body}"
    end

    result = JSON.parse(response.body)
    Rails.logger.info "File uploaded successfully: #{result['name']}"
    result
  rescue JSON::ParserError => e
    raise ComfyuiError, "Invalid response from upload: #{e.message}"
  rescue Errno::ECONNREFUSED, Errno::ETIMEDOUT, SocketError => e
    raise ComfyuiError, "Connection error: #{e.message}"
  end

  # Queue a workflow prompt for execution
  # @param workflow [Hash] The workflow JSON structure
  # @return [String] The prompt_id for tracking
  def self.queue_prompt(workflow)
    Rails.logger.info "Queuing ComfyUI prompt"

    response = post("/prompt",
      body: { prompt: workflow }.to_json,
      headers: { "Content-Type" => "application/json" },
      timeout: 30
    )

    unless response.success?
      Rails.logger.error "ComfyUI queue error: #{response.body}"
      raise ComfyuiError, "Failed to queue prompt: #{response.code} - #{response.body}"
    end

    response_data = response.parsed_response || JSON.parse(response.body)
    prompt_id = response_data["prompt_id"]

    unless prompt_id
      raise ComfyuiError, "No prompt_id returned from ComfyUI"
    end

    Rails.logger.info "Prompt queued with ID: #{prompt_id}"
    prompt_id
  rescue HTTParty::Error => e
    raise ComfyuiError, "Network error: #{e.message}"
  end

  # Get the history/status of a prompt
  # @param prompt_id [String] The prompt ID to check
  # @return [Hash, nil] The history entry or nil if not ready
  def self.get_history(prompt_id)
    response = get("/history/#{prompt_id}")
    return nil unless response.success?

    data = response.parsed_response || JSON.parse(response.body)
    data[prompt_id]
  rescue HTTParty::Error, JSON::ParserError
    nil
  end

  # Wait for a prompt to complete and return its outputs
  # @param prompt_id [String] The prompt ID to wait for
  # @param timeout [Integer] Timeout in seconds
  # @param output_node_id [String] The node ID that produces output
  # @return [Hash] The outputs from the specified node
  def self.wait_for_completion(prompt_id, timeout: 60, output_node_id: nil)
    start_time = Time.current

    loop do
      history = get_history(prompt_id)

      if history
        # Check if the prompt completed (works even when outputs is empty)
        status = history["status"]
        if status && status["completed"]
          outputs = history["outputs"] || {}

          # If output_node_id specified, return that node's output
          if output_node_id && outputs[output_node_id.to_s]
            return outputs[output_node_id.to_s]
          end

          # Return outputs (may be empty for nodes like Hy3D21ExportMesh)
          return outputs
        end
      end

      if Time.current - start_time > timeout
        raise ComfyuiError, "Timeout waiting for completion (#{timeout}s)"
      end

      sleep 2
    end
  end

  # Fetch an output file from ComfyUI
  # @param filename [String] The output filename
  # @param subfolder [String] The subfolder (usually empty for outputs)
  # @param type [String] The type (input, output, temp)
  # @return [String] The raw file content
  def self.get_output_file(filename, subfolder: "", type: "output")
    Rails.logger.info "ComfyUI: Fetching file #{filename} (type: #{type}, subfolder: #{subfolder.presence || 'root'})"
    response = get("/view",
      query: {
        filename: filename,
        subfolder: subfolder,
        type: type
      },
      timeout: 120  # Increased timeout for large audio files (~12MB each)
    )

    unless response.success?
      raise ComfyuiError, "Failed to fetch output: #{response.code}"
    end

    response.body
  rescue HTTParty::Error => e
    raise ComfyuiError, "Network error fetching output: #{e.message}"
  end

  # Build URL to view a file from ComfyUI
  # @param filename [String] The filename
  # @param subfolder [String] The subfolder
  # @param type [String] The type (input, output, temp)
  # @return [String] The full URL
  def self.get_output_url(filename, subfolder: "", type: "output")
    params = URI.encode_www_form({
      filename: filename,
      subfolder: subfolder,
      type: type
    })
    "#{base_uri}/view?#{params}"
  end

  # Load a workflow from the workflows directory
  # @param workflow_name [String] The workflow filename (e.g., "AUSTNNETREMBG.json")
  # @return [Hash] The parsed workflow
  def self.load_workflow(workflow_name)
    workflow_path = Rails.root.join("workflows", workflow_name)

    unless File.exist?(workflow_path)
      raise ComfyuiError, "Workflow not found: #{workflow_name}"
    end

    JSON.parse(File.read(workflow_path))
  rescue JSON::ParserError => e
    raise ComfyuiError, "Invalid workflow JSON: #{e.message}"
  end
end
