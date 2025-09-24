class ChatController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:complete]

  def index
    # Render the chat interface view
  end

  def stream
    # Renamed to complete for clarity since we're not streaming
    complete
  end

  def complete
    begin
      # Parse the JSON body
      request_body = JSON.parse(request.body.read)
      messages = request_body["messages"] || []
      system_prompt = request_body["system_prompt"] || "You are a helpful AI assistant."

      # Log for debugging
      Rails.logger.info "Received #{messages.length} messages for completion"

      # Use the ChatService to make a non-streaming API call
      chat_service = ChatService.new
      response_content = chat_service.completion(messages, system_prompt)

      # Return the complete response as JSON
      render json: { content: response_content }
    rescue StandardError => e
      Rails.logger.error "Chat error: #{e.message}"
      Rails.logger.error e.backtrace.first(5).join("\n")
      render json: { error: e.message }, status: :internal_server_error
    end
  end
end