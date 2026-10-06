class ChatCompletionJob < GpuJob
  self.gpu_service_name = "chat"

  # Arguments carry the visitor's messages; keep them out of the logs.
  self.log_arguments = false

  RESULT_TTL = 30.minutes

  def perform(job_id, messages)
    store("chat_job:#{job_id}:status", { status: "processing", started_at: Time.current })

    content = ChatService.new.completion(messages)

    store("chat_job:#{job_id}", { status: "completed", content: content, completed_at: Time.current }, ttl: RESULT_TTL)
    store("chat_job:#{job_id}:status", { status: "completed" })
    self.class.mark_service_online
  end

  def self.check_status(job_id)
    read("chat_job:#{job_id}:status") || { "status" => "pending" }
  end

  def self.get_chat_result(job_id)
    read("chat_job:#{job_id}")
  end

  def self.read(key)
    value = redis.get(key)
    JSON.parse(value) if value
  rescue JSON::ParserError
    nil
  end
  private_class_method :read

  private

  def record_failure(public_error)
    job_id = arguments.first
    failure = { status: "failed", failed_at: Time.current, **public_error.to_h }
    store("chat_job:#{job_id}", failure, ttl: FAILED_STATUS_TTL)
    store("chat_job:#{job_id}:status", failure, ttl: FAILED_STATUS_TTL)
  end

  def store(key, value, ttl: 1.hour)
    redis.setex(key, ttl.to_i, value.to_json)
  end
end
