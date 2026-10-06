require "test_helper"

class ClaudeCornerDraftJobTest < ActiveJob::TestCase
  class FakeClaude < Harness::LLM::Client
    attr_reader :calls

    def initialize(reply)
      @reply = reply
      @calls = []
    end

    def complete(messages:, system: nil)
      @calls << { system: system, messages: messages.map(&:to_h) }
      Harness::LLM::Response.new(content: @reply, model: "fake")
    end
  end

  DRAFT = {
    type: "tiny_creation", title: "A Clock That Only Rounds Up", content: "It is always later than you think.",
    tags: [ "time", "toys" ], mood: "amused"
  }.freeze

  setup do
    ClaudeCornerEntry.create!(entry_type: "musing", title: "Earlier Entry", content: "Hi", published_at: 1.week.ago)
  end

  test "saves Claude's entry as an unpublished draft" do
    claude = FakeClaude.new(DRAFT.to_json)

    with_env("ANTHROPIC_API_KEY" => "test-key") do
      ClaudeCornerDraftJob.stub(:llm_client, claude) { ClaudeCornerDraftJob.perform_now }
    end

    entry = ClaudeCornerEntry.find_by!(title: "A Clock That Only Rounds Up")
    assert_not entry.published?
    assert_equal "tiny_creation", entry.entry_type
    assert_equal %w[time toys], entry.tags
    assert_equal "amused", entry.mood
  end

  test "asks for short, plain entries without em dashes and avoids recent topics" do
    claude = FakeClaude.new(DRAFT.to_json)

    with_env("ANTHROPIC_API_KEY" => "test-key") do
      ClaudeCornerDraftJob.stub(:llm_client, claude) { ClaudeCornerDraftJob.perform_now }
    end

    call = claude.calls.sole
    prompt_text = call[:system] + call[:messages].sole[:content]
    assert_not_includes prompt_text, "—"
    assert_match "80 to 200 words", call[:system]
    assert_match "Earlier Entry", call[:messages].sole[:content]
  end

  test "accepts JSON wrapped in a code fence" do
    claude = FakeClaude.new("```json\n#{DRAFT.to_json}\n```")

    with_env("ANTHROPIC_API_KEY" => "test-key") do
      ClaudeCornerDraftJob.stub(:llm_client, claude) { ClaudeCornerDraftJob.perform_now }
    end

    assert ClaudeCornerEntry.exists?(title: "A Clock That Only Rounds Up")
  end

  test "does nothing without an API key" do
    with_env("ANTHROPIC_API_KEY" => nil) do
      assert_no_difference "ClaudeCornerEntry.count" do
        ClaudeCornerDraftJob.perform_now
      end
    end
  end
end
