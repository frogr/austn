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

    Rails.logger.info "Connecting to LMStudio at #{uri}"

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

    Rails.logger.info "Sending request with #{full_messages.length} messages"
    request.body = request_body.to_json

    http.request(request) do |response|
      Rails.logger.info "LMStudio responded with status: #{response.code}"

      if response.code != '200'
        error_body = response.read_body
        Rails.logger.error "LMStudio error response: #{error_body}"
        yield({ error: "LMStudio returned #{response.code}: #{error_body}" })
        return
      end

      buffer = ""
      response.read_body do |chunk|
        buffer += chunk
        lines = buffer.split("\n")

        # Keep the last incomplete line in buffer
        if lines.last && !buffer.end_with?("\n")
          buffer = lines.pop
        else
          buffer = ""
        end

        lines.each do |line|
          next if line.strip.empty?

          if line.start_with?("data: ")
            data = line[6..]
            next if data.strip == "[DONE]"

            begin
              parsed = JSON.parse(data)
              content = parsed.dig("choices", 0, "delta", "content")
              if content
                Rails.logger.debug "Yielding content: #{content}"
                yield({ content: content })
              end
            rescue JSON::ParserError => e
              Rails.logger.error "Failed to parse SSE data: #{e.message}, line: #{line}"
            end
          end
        end
      end
    end

    Rails.logger.info "Stream completed successfully"
  rescue => e
    Rails.logger.error "ChatService error: #{e.message}"
    Rails.logger.error e.backtrace.first(5).join("\n")
    yield({ error: "Failed to connect to LMStudio: #{e.message}" })
  end

  def completion(messages, system_prompt)
    full_messages = build_messages(messages, system_prompt)

    uri = URI.parse("#{@base_url}#{@endpoint}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.read_timeout = 60
    http.open_timeout = 10

    request = Net::HTTP::Post.new(uri.path)
    request['Content-Type'] = 'application/json'

    request.body = {
      model: DEFAULT_MODEL,
      messages: full_messages,
      temperature: 0.7,
      max_tokens: 2000
    }.to_json

    response = http.request(request)

    if response.code == '200'
      parsed = JSON.parse(response.body)
      parsed.dig("choices", 0, "message", "content")
    else
      raise "LMStudio returned #{response.code}: #{response.body}"
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