module Nyc
  # Turns unstructured prose (newsletter HTML, listing pages) into an array
  # of structured event hashes via Claude Haiku. Returns [] on any error so
  # one bad source can't take down a scrape run.
  class EventExtractor
    MODEL = "claude-haiku-4-5".freeze
    MAX_TOKENS = 4000

    SYSTEM = <<~PROMPT.freeze
      You extract events from NYC content. Return ONLY a JSON object with shape:
      { "events": [ {...}, ... ] }

      Each event must have:
        title (string), venue_name (string or null), address (string or null),
        start_datetime (ISO 8601 with NYC timezone, or null if unknown),
        end_datetime (ISO 8601 or null), category (one of: concert, happy_hour,
        sports, tattoo, comedy, art, free, other), price_text (string or null),
        url (string or null), description (one short sentence).

      Rules:
        - Skip anything that's not a real attendable event in NYC.
        - Skip article roundups, listicles, or links to other content.
        - If multiple events are bundled, emit one per event.
        - Use null, not empty strings, for unknown fields.
        - Today's date is #{Date.current.iso8601}; resolve relative dates ("tonight",
          "this Friday") against it.
    PROMPT

    def self.extract(content:, source:)
      new.extract(content: content, source: source)
    end

    def extract(content:, source:)
      return [] if content.blank?
      api_key = ENV["ANTHROPIC_API_KEY"]
      if api_key.blank?
        Rails.logger.warn("[Nyc::EventExtractor] ANTHROPIC_API_KEY missing, skipping extraction for #{source}")
        return []
      end

      client = Harness::LLM::AnthropicClient.new(api_key: api_key, model: MODEL, max_tokens: MAX_TOKENS)
      prompt = Harness::LLM::Prompt.new(
        role: :user,
        content: "Extract events from this #{source} content:\n\n#{content}"
      )
      response = client.complete(messages: [ prompt ], system: SYSTEM)
      parse(response.content)
    rescue StandardError => e
      Rails.logger.error("[Nyc::EventExtractor] #{source} failed: #{e.class}: #{e.message}")
      []
    end

    private

    def parse(text)
      return [] if text.blank?
      json = extract_json(text)
      return [] unless json.is_a?(Hash)
      Array(json["events"]).select { |e| e.is_a?(Hash) }
    rescue JSON::ParserError => e
      Rails.logger.warn("[Nyc::EventExtractor] JSON parse failed: #{e.message}")
      []
    end

    def extract_json(text)
      stripped = text.strip
      stripped = stripped.sub(/\A```(?:json)?/, "").sub(/```\z/, "").strip
      first = stripped.index("{")
      last = stripped.rindex("}")
      return nil unless first && last && last > first
      JSON.parse(stripped[first..last])
    end
  end
end
