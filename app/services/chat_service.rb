require "net/http"
require "json"
require "uri"

# Chat completions from LM Studio on the GPU box. Message content is never
# logged.
class ChatService
  DEFAULT_MODEL = "qwen/qwen2.5-coder-14b".freeze
  SYSTEM_PROMPT = "You are a helpful AI assistant. Be concise, friendly, and informative.".freeze
  ENDPOINT = "/v1/chat/completions".freeze

  def initialize
    @base_url = Gpu::Backend.url!(:lmstudio)
  end

  # @param messages [Array<Hash>] user and assistant turns, already validated by ChatRequest
  # @return [String] the assistant's reply
  def completion(messages)
    uri = URI.parse("#{@base_url}#{ENDPOINT}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == "https"
    http.open_timeout = 10
    http.read_timeout = 300

    request = Net::HTTP::Post.new(uri.path)
    request["Content-Type"] = "application/json"
    request.body = {
      model: DEFAULT_MODEL,
      messages: [ { role: "system", content: SYSTEM_PROMPT }, *messages ],
      stream: false,
      temperature: 0.7,
      max_tokens: 2000
    }.to_json

    response = Gpu.translating_network_errors { http.request(request) }
    raise Gpu::Error, "LM Studio returned HTTP #{response.code}" unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body).dig("choices", 0, "message", "content")
  end
end
