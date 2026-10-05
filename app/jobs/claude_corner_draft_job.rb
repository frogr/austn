# Once a month, asks Claude for one new Claude Corner entry and saves it as
# an unpublished draft for Austin to review at /admin/claude_corner_entries.
class ClaudeCornerDraftJob < ApplicationJob
  queue_as :default
  sidekiq_options retry: 2

  DEFAULT_MODEL = "claude-sonnet-4-5".freeze

  SYSTEM_PROMPT = <<~PROMPT.freeze
    You write entries for Claude Corner, a small page on austn.net, the personal site of Austin French, a software engineer in New York.
    Each entry is something you find interesting and want to share: a thought, a small discovery, a tiny piece of code, a question, or a recommendation.
    Write in plain, direct language, like a note to a friend.
    Keep it short: 80 to 200 words.
    Do not use em dashes. Use commas, periods or parentheses instead.
    No hype, no exclamation marks, no emoji.
  PROMPT

  def self.llm_client
    Harness::LLM::AnthropicClient.new(
      api_key: ENV.fetch("ANTHROPIC_API_KEY"),
      model: ENV.fetch("CLAUDE_CORNER_MODEL", DEFAULT_MODEL),
      max_tokens: 1_024
    )
  end

  def perform
    if ENV["ANTHROPIC_API_KEY"].blank?
      Rails.logger.warn "ClaudeCornerDraftJob skipped: ANTHROPIC_API_KEY is not set"
      return
    end

    response = self.class.llm_client.complete(
      system: SYSTEM_PROMPT,
      messages: [ Harness::LLM::Prompt.new(role: :user, content: request_prompt) ]
    )
    draft = parse(response.content)

    ClaudeCornerEntry.create!(
      entry_type: draft.fetch("type"),
      title: draft.fetch("title"),
      content: draft.fetch("content"),
      tags: Array(draft["tags"]).map(&:to_s).first(3),
      mood: draft["mood"]
    )
  end

  private

  def request_prompt
    recent_titles = ClaudeCornerEntry.newest_first.limit(12).pluck(:title)

    <<~PROMPT
      Write one new entry. Pick one type: #{ClaudeCornerEntry::TYPES.join(", ")}.
      Use Markdown for the body. A code_sketch should include one short code block.
      Do not repeat these recent titles or their topics: #{recent_titles.join("; ").presence || "none yet"}.

      Reply with only a JSON object with these keys:
      "type", "title", "content", "tags" (one to three lowercase words), "mood" (one word).
    PROMPT
  end

  # Claude sometimes wraps JSON in a Markdown code fence.
  def parse(content)
    JSON.parse(content.to_s.strip.delete_prefix("```json").delete_prefix("```").delete_suffix("```"))
  end
end
