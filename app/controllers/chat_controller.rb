class ChatController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [ :complete, :async_complete, :job_status ]

  def index
    # Render the chat interface view
  end

  def stream
    # For backward compatibility, redirect to async_complete
    async_complete
  end

  def complete
    # Legacy synchronous endpoint (kept for compatibility)
    begin
      request_body = JSON.parse(request.body.read)
      messages = request_body["messages"] || []
      system_prompt = request_body["system_prompt"] || "You are a helpful AI assistant."

      Rails.logger.info "Received #{messages.length} messages for completion"

      chat_service = ChatService.new
      response_content = chat_service.completion(messages, system_prompt)

      render json: { content: response_content }
    rescue StandardError => e
      Rails.logger.error "Chat error: #{e.message}"
      Rails.logger.error e.backtrace.first(5).join("\n")
      render json: { error: e.message }, status: :internal_server_error
    end
  end

  def async_complete
    # New asynchronous endpoint using Sidekiq
    begin
      request_body = JSON.parse(request.body.read)
      messages = request_body["messages"] || []
      system_prompt = request_body["system_prompt"] || "You are a helpful AI assistant."
      use_async = request_body["async"] != false # Default to async

      Rails.logger.info "Received #{messages.length} messages for async completion"

      if use_async
        # Generate a unique job ID
        job_id = SecureRandom.uuid

        # Enqueue the job
        ChatCompletionJob.perform_later(messages, system_prompt, job_id)

        # Return job ID immediately
        render json: { job_id: job_id, status: "queued" }
      else
        # Fallback to synchronous for backwards compatibility
        complete
      end
    rescue StandardError => e
      Rails.logger.error "Async chat error: #{e.message}"
      render json: { error: e.message }, status: :internal_server_error
    end
  end

  def job_status
    job_id = params[:id]

    unless job_id.present?
      render json: { error: "Job ID required" }, status: :bad_request
      return
    end

    # Check job status
    status = ChatCompletionJob.check_status(job_id)

    if status["status"] == "completed"
      # Get the full result
      result = ChatCompletionJob.get_chat_result(job_id)
      render json: result
    else
      render json: status
    end
  end
end
