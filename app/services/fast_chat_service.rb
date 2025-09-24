require 'socket'
require 'json'
require 'uri'

class FastChatService
  DEFAULT_MODEL = "qwen/qwen2.5-coder-14b"

  def initialize
    @base_url = ENV.fetch('LMSTUDIO_URL', 'http://100.68.94.33:1234')
    @endpoint = '/v1/chat/completions'
  end

  def stream_completion(messages, system_prompt, &block)
    full_messages = build_messages(messages, system_prompt)
    uri = URI.parse("#{@base_url}#{@endpoint}")

    Rails.logger.info "Fast streaming to LMStudio at #{uri.host}:#{uri.port}"

    # Use raw TCP socket for lower latency
    socket = TCPSocket.new(uri.host, uri.port)

    # Build HTTP request manually
    request_body = {
      model: DEFAULT_MODEL,
      messages: full_messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000
    }.to_json

    http_request = [
      "POST #{uri.path} HTTP/1.1",
      "Host: #{uri.host}:#{uri.port}",
      "Content-Type: application/json",
      "Accept: text/event-stream",
      "Connection: keep-alive",
      "Content-Length: #{request_body.bytesize}",
      "",
      request_body
    ].join("\r\n")

    socket.write(http_request)
    socket.flush

    # Read response headers
    headers = {}
    while line = socket.gets
      break if line == "\r\n"
      if line.include?(':')
        key, value = line.split(':', 2)
        headers[key.strip.downcase] = value.strip
      elsif line.start_with?("HTTP/")
        status_code = line.split(' ')[1]
        if status_code != "200"
          Rails.logger.error "LMStudio returned status: #{status_code}"
          yield({ error: "LMStudio returned status #{status_code}" })
          socket.close
          return
        end
      end
    end

    # Stream the response body
    buffer = ""
    while !socket.closed? && !socket.eof?
      chunk = socket.read_nonblock(1024) rescue nil
      break unless chunk

      buffer += chunk
      lines = buffer.split("\n")

      # Keep incomplete line in buffer
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
              yield({ content: content })
            end
          rescue JSON::ParserError => e
            Rails.logger.debug "Skipping non-JSON line: #{line}"
          end
        end
      end
    end

    socket.close
    Rails.logger.info "Fast stream completed"
  rescue => e
    Rails.logger.error "FastChatService error: #{e.message}"
    yield({ error: "Failed to connect: #{e.message}" })
  ensure
    socket&.close
  end

  private

  def build_messages(user_messages, system_prompt)
    messages = []

    if system_prompt.present?
      messages << { role: "system", content: system_prompt }
    end

    user_messages.each do |msg|
      messages << {
        role: msg["role"] || msg[:role],
        content: msg["content"] || msg[:content]
      }
    end

    messages
  end
end