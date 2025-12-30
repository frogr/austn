require "httparty"

class GroqService
  include HTTParty
  base_uri "https://api.groq.com/openai/v1"

  class GroqError < StandardError; end

  DEFAULT_MODEL = "llama-3.3-70b-versatile"
  MAX_OUTPUT_TOKENS = 300
  TEMPERATURE = 0.85

  BOOTSTRAP_PROMPT = <<~PROMPT
    Begin the story. Set the scene with Austin and Kiaan already on the run—they've been at this for a while now.
    Don't start at the very beginning. Drop us into a moment: a motel room at 3am, a gas station on an empty highway,
    a diner where the waitress looks at them too long. The Man's presence should be felt but not seen.
    Write EXACTLY ONE paragraph (3-6 sentences).
  PROMPT

  def self.generate_paragraph(system_prompt, context_paragraphs = [])
    api_key = ENV.fetch("GROQ_API_KEY") do
      raise GroqError, "GROQ_API_KEY environment variable not set"
    end

    messages = build_messages(system_prompt, context_paragraphs)

    Rails.logger.info "GroqService: Generating paragraph with #{context_paragraphs.length} context paragraphs"

    response = post("/chat/completions",
      headers: {
        "Authorization" => "Bearer #{api_key}",
        "Content-Type" => "application/json"
      },
      body: {
        model: DEFAULT_MODEL,
        messages: messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
        top_p: 0.9
      }.to_json,
      timeout: 30
    )

    unless response.success?
      Rails.logger.error "Groq error: #{response.code} - #{response.body}"
      raise GroqError, "Groq API error: #{response.code}"
    end

    data = response.parsed_response
    content = data.dig("choices", 0, "message", "content")&.strip

    unless content.present?
      raise GroqError, "Groq returned empty content"
    end

    usage = data["usage"] || {}

    Rails.logger.info "GroqService: Generated paragraph (#{usage['completion_tokens']} tokens)"

    {
      content: content,
      model: data["model"] || DEFAULT_MODEL,
      prompt_tokens: usage["prompt_tokens"],
      completion_tokens: usage["completion_tokens"],
      total_tokens: usage["total_tokens"]
    }
  rescue HTTParty::Error, Net::OpenTimeout, Net::ReadTimeout => e
    Rails.logger.error "GroqService network error: #{e.message}"
    raise GroqError, "Network error: #{e.message}"
  end

  def self.build_messages(system_prompt, context_paragraphs)
    messages = [
      { role: "system", content: system_prompt }
    ]

    if context_paragraphs.empty?
      messages << { role: "user", content: BOOTSTRAP_PROMPT }
    else
      story_so_far = context_paragraphs.map(&:content).join("\n\n")
      messages << {
        role: "user",
        content: "Here is the story so far:\n\n#{story_so_far}\n\nContinue with the next paragraph:"
      }
    end

    messages
  end

  def self.health_check
    api_key = ENV["GROQ_API_KEY"]
    return { status: "unconfigured", error: "API key not set" } unless api_key

    response = get("/models",
      headers: { "Authorization" => "Bearer #{api_key}" },
      timeout: 5
    )

    if response.success?
      { status: "online", models_available: true }
    else
      { status: "error", code: response.code }
    end
  rescue => e
    { status: "unreachable", error: e.message }
  end
end
