class ChatController < ApplicationController
  include RequiresGpu

  requires_gpu "chat", only: :async_complete

  def index
  end

  def async_complete
    chat = ChatRequest.new(params.permit(messages: %i[role content]).fetch(:messages, []))
    return render_invalid_input(chat.errors.full_messages.first) if chat.invalid?

    job_id = SecureRandom.uuid
    ChatCompletionJob.perform_later(job_id, chat.messages)

    render json: { job_id: job_id, status: "queued" }
  rescue => e
    render_gpu_error(e)
  end

  def job_status
    status = ChatCompletionJob.check_status(params[:id])

    if status["status"] == "completed"
      render json: ChatCompletionJob.get_chat_result(params[:id])
    else
      render json: status
    end
  end
end
