module Harness
  module LLM
    class AnthropicClient < Client
      API_URL = "https://api.anthropic.com/v1/messages"

      def initialize(api_key:, model:, max_tokens: 4096)
        @api_key = api_key
        @model = model
        @max_tokens = max_tokens
      end

      def complete(messages:, system: nil)
        body = build_body(messages, system)
        raw = post(body)
        parse_response(raw)
      end

      private

      def build_body(messages, system)
        {
          model: @model,
          max_tokens: @max_tokens,
          messages: messages.map(&:to_h),
          system: system
        }.compact.to_json
      end

      def post(body)
        uri = URI(API_URL)
        request = Net::HTTP::Post.new(uri)
        request["Content-Type"] = "application/json"
        request["x-api-key"] = @api_key
        request["anthropic-version"] = "2023-06-01"
        request.body = body

        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
          http.request(request)
        end

        JSON.parse(response.body, symbolize_names: true)
      end

      def parse_response(raw)
        Response.new(
          content: raw.dig(:content, 0, :text) || "",
          model: raw[:model],
          input_tokens: raw.dig(:usage, :input_tokens) || 0,
          output_tokens: raw.dig(:usage, :output_tokens) || 0
        )
      end
    end
  end
end
