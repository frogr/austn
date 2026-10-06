require "net/http"

# Thin client for the ComfyUI API on the GPU box: upload an input file,
# queue a workflow, wait for it to finish and fetch its outputs.
#
# Network failures surface as Gpu::Offline, Gpu::ConnectionError or
# Gpu::Timeout; problems reported by ComfyUI itself raise ComfyuiError.
class ComfyuiClient
  class ComfyuiError < StandardError; end

  WORKFLOWS_DIR = Rails.root.join("workflows")
  OPEN_TIMEOUT = 5 # seconds
  POLL_INTERVAL = 2 # seconds

  # @return [Hash] ComfyUI's {"name", "subfolder", "type"} for the stored file
  def self.upload_file(file_path, subfolder: "")
    uri = URI("#{base_url}/upload/image")
    request = Net::HTTP::Post.new(uri)

    response = File.open(file_path, "rb") do |file|
      form = [ [ "image", file, { filename: File.basename(file_path) } ] ]
      form << [ "subfolder", subfolder ] if subfolder.present?
      request.set_form(form, "multipart/form-data")

      Gpu.translating_network_errors do
        Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https",
                        open_timeout: OPEN_TIMEOUT, read_timeout: 30) do |http|
          http.request(request)
        end
      end
    end

    raise ComfyuiError, "Upload failed with HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  rescue JSON::ParserError
    raise ComfyuiError, "Upload returned invalid JSON"
  end

  # @return [String] the prompt_id to wait on
  def self.queue_prompt(workflow)
    response = request(:post, "/prompt",
      body: { prompt: workflow }.to_json,
      headers: { "Content-Type" => "application/json" },
      read_timeout: 30)

    unless response.success?
      raise ComfyuiError, "Queueing the prompt failed with HTTP #{response.code}: #{response.body.to_s.truncate(500)}"
    end

    response.parsed_response["prompt_id"] || raise(ComfyuiError, "ComfyUI did not return a prompt_id")
  end

  # @return [Hash, nil] the history entry, or nil while the prompt is still running
  def self.get_history(prompt_id)
    response = request(:get, "/history/#{prompt_id}", read_timeout: 30)
    return unless response.success?

    response.parsed_response[prompt_id]
  rescue JSON::ParserError
    nil
  end

  # Polls until the prompt completes.
  #
  # @return [Hash] the outputs of output_node_id when given and present, otherwise all outputs
  # @raise [Gpu::Timeout] if it does not complete within timeout seconds
  def self.wait_for_completion(prompt_id, timeout: 60, output_node_id: nil)
    deadline = timeout.seconds.from_now

    loop do
      history = get_history(prompt_id)

      if history&.dig("status", "completed")
        outputs = history["outputs"] || {}
        return outputs[output_node_id.to_s] if output_node_id && outputs.key?(output_node_id.to_s)

        return outputs
      end

      raise Gpu::Timeout, "ComfyUI prompt #{prompt_id} did not finish within #{timeout}s" if Time.current > deadline

      sleep POLL_INTERVAL
    end
  end

  # @return [String] the raw file content
  def self.get_output_file(filename, subfolder: "", type: "output")
    response = request(:get, "/view",
      query: { filename: filename, subfolder: subfolder, type: type },
      read_timeout: 120) # stems and songs can be large

    raise ComfyuiError, "Fetching #{filename} failed with HTTP #{response.code}" unless response.success?

    response.body
  end

  # @param workflow_name [String] a file in workflows/, e.g. "AUSTNNETREMBG.json"
  def self.load_workflow(workflow_name)
    path = WORKFLOWS_DIR.join(workflow_name)
    raise ComfyuiError, "Workflow not found: #{workflow_name}" unless File.exist?(path)

    JSON.parse(File.read(path))
  rescue JSON::ParserError => e
    raise ComfyuiError, "Invalid workflow JSON in #{workflow_name}: #{e.message}"
  end

  def self.base_url
    Gpu::Backend.url!(:comfyui)
  end

  def self.request(method, path, read_timeout:, **options)
    Gpu.translating_network_errors do
      HTTParty.public_send(method, "#{base_url}#{path}",
        open_timeout: OPEN_TIMEOUT, read_timeout: read_timeout, **options)
    end
  end
  private_class_method :base_url, :request
end
