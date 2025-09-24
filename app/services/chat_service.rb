require 'net/http'
require 'json'
require 'uri'

class ChatService
  DEFAULT_MODEL = "qwen/qwen2.5-coder-14b"

  def initialize
    @base_url = ENV.fetch('LMSTUDIO_URL', 'http://100.68.94.33:1234')
    @endpoint = '/v1/chat/completions'
  end

  def stream_completion(messages, system_prompt, &block)
    full_messages = build_messages(messages, system_prompt)

    uri = URI.parse("#{@base_url}#{@endpoint}")


    # Simple, direct HTTP request without extra buffering
    http = Net::HTTP.new(uri.host, uri.port)
    http.read_timeout = 120
    http.open_timeout = 10

    request = Net::HTTP::Post.new(uri.path)
    request['Content-Type'] = 'application/json'
    request['Accept'] = 'text/event-stream'

    request_body = {
      model: DEFAULT_MODEL,
      messages: full_messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    }

    request.body = request_body.to_json

    # Direct streaming with block to avoid read_body being called twice
    buffer = ""
    http.request(request) do |response|
      if response.code != '200'
        yield({ error: "LMStudio returned #{response.code}" })
        return
      end

      response.read_body do |chunk|
        buffer += chunk

        # Process complete lines immediately
        while (line_end = buffer.index("\n"))
          line = buffer[0..line_end].strip
          buffer = buffer[(line_end + 1)..-1]

          next if line.empty?

          if line.start_with?("data: ")
            data = line[6..]
            next if data == "[DONE]"

            begin
              parsed = JSON.parse(data)
              content = parsed.dig("choices", 0, "delta", "content")
              yield({ content: content }) if content
            rescue JSON::ParserError
              # Skip non-JSON lines
            end
          end
        end
      end
    end

  rescue => e
    Rails.logger.error "ChatService error: #{e.message}"
    yield({ error: "Failed to connect to LMStudio: #{e.message}" })
  end

  def completion(messages, system_prompt)
    full_messages = build_messages(messages, system_prompt)

    uri = URI.parse("#{@base_url}#{@endpoint}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.read_timeout = 300  # 5 minutes for completion
    http.open_timeout = 10

    request = Net::HTTP::Post.new(uri.path)
    request['Content-Type'] = 'application/json'

    request_payload = {
      model: DEFAULT_MODEL,
      messages: full_messages,
      stream: false,  # Explicitly set to false for non-streaming
      temperature: 0.7,
      max_tokens: 2000
    }

    Rails.logger.info "Sending request to LMStudio: #{uri}"
    Rails.logger.info "Request payload: #{request_payload.to_json}"

    request.body = request_payload.to_json
    response = http.request(request)

    Rails.logger.info "LMStudio responded with code: #{response.code}"

    if response.code == '200'
      parsed = JSON.parse(response.body)
      content = parsed.dig("choices", 0, "message", "content")
      Rails.logger.info "Successfully got response: #{content&.first(100)}..."
      content
    else
      error_msg = "LMStudio returned #{response.code}: #{response.body}"
      Rails.logger.error error_msg
      raise error_msg
    end
  rescue => e
    Rails.logger.error "ChatService completion error: #{e.message}"
    raise
  end

  private

  def build_messages(user_messages, system_prompt)
    messages = []

    # Add system prompt if provided
    if system_prompt.present?
      messages << { role: "system", content: system_prompt }
    end

    # Add user messages
    user_messages.each do |msg|
      messages << {
        role: msg["role"] || msg[:role],
        content: msg["content"] || msg[:content]
      }
    end

    messages
  end
end