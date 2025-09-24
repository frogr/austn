class ChatCompletionJob < GpuJob
  def perform(messages, system_prompt, job_id)
    Rails.logger.info "Starting ChatCompletionJob #{job_id}"

    # Store initial status
    store_result("chat_job:#{job_id}:status", { status: "processing", started_at: Time.current })

    begin
      # Use the existing ChatService to make the API call
      chat_service = ChatService.new
      response_content = chat_service.completion(messages, system_prompt)

      # Store successful result
      result = {
        status: "completed",
        content: response_content,
        completed_at: Time.current
      }
      store_result("chat_job:#{job_id}", result, ttl: 1800) # Keep for 30 minutes
      store_result("chat_job:#{job_id}:status", { status: "completed" })

      Rails.logger.info "ChatCompletionJob #{job_id} completed successfully"
    rescue => e
      Rails.logger.error "ChatCompletionJob #{job_id} failed: #{e.message}"

      # Store error result
      error_result = {
        status: "failed",
        error: e.message,
        failed_at: Time.current
      }
      store_result("chat_job:#{job_id}", error_result, ttl: 600) # Keep errors for 10 minutes
      store_result("chat_job:#{job_id}:status", { status: "failed", error: e.message })

      # Re-raise to trigger retry logic
      raise
    end
  end

  # Class method to check job status
  def self.check_status(job_id)
    get_result("chat_job:#{job_id}:status") || { status: "pending" }
  end

  # Class method to get job result
  def self.get_chat_result(job_id)
    get_result("chat_job:#{job_id}")
  end
end
