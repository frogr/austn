class ChatController < ApplicationController
  include ActionController::Live

  def index
    # Render the chat interface view
  end

  def stream
    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["X-Accel-Buffering"] = "no"
    response.headers["Connection"] = "keep-alive"

    begin
      messages = JSON.parse(params[:messages]) rescue []
      system_prompt = params[:system_prompt] || "You are a helpful AI assistant."

      Rails.logger.info "Starting chat stream with #{messages.length} messages"

      # Use the ChatService to make the API call
      chat_service = ChatService.new
      chat_service.stream_completion(messages, system_prompt) do |chunk|
        Rails.logger.debug "Writing chunk: #{chunk.inspect}"
        response.stream.write("data: #{chunk.to_json}\n\n")
      end

      # Send done signal
      response.stream.write("data: [DONE]\n\n")
    rescue => e
      Rails.logger.error "Chat streaming error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      response.stream.write("data: #{{ error: e.message }.to_json}\n\n")
    ensure
      response.stream.close
    end
  end
end