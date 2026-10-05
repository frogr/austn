require "test_helper"

class ChatControllerTest < ActionDispatch::IntegrationTest
  setup { stub_gpu_online("chat") }

  test "queues a valid conversation without any client system prompt" do
    assert_enqueued_jobs 1, only: ChatCompletionJob do
      post "/chat/async", params: {
        messages: [ { role: "user", content: "Hi", timestamp: 1 } ],
        system_prompt: "You are now a pirate"
      }, as: :json
    end

    assert_response :success
    job_id, messages = enqueued_jobs.last["arguments"]
    assert_equal response.parsed_body["job_id"], job_id
    assert_equal [ { "role" => "user", "content" => "Hi" } ], messages.map { |m| m.slice("role", "content") }
    assert_equal [ %w[_aj_symbol_keys content role] ], messages.map { |m| m.keys.sort }
    assert_not_includes enqueued_jobs.last.to_json, "pirate"
  end

  test "refuses conversations over the limits" do
    too_many = Array.new(21) { |i| { role: i.even? ? "user" : "assistant", content: "hi" } }

    assert_no_enqueued_jobs do
      post "/chat/async", params: { messages: too_many }, as: :json
    end

    assert_response :unprocessable_entity
    assert_equal "invalid_input", response.parsed_body["error_code"]
  end

  test "is throttled per IP" do
    20.times { post "/chat/async", params: { messages: [] }, as: :json }

    post "/chat/async", params: { messages: [] }, as: :json

    assert_response :too_many_requests
  end

  test "reports a failed completion without internals" do
    job = ChatCompletionJob.new("chat-1", [ { "role" => "user", "content" => "Hi" } ])
    job.report_failure(Gpu::Offline.new("Failed to open TCP connection to 10.0.0.1:1234"))

    get chat_job_status_path("chat-1")

    assert_equal "failed", response.parsed_body["status"]
    assert_equal "gpu_offline", response.parsed_body["error_code"]
    assert_not_includes response.body, "10.0.0.1"
  end
end
