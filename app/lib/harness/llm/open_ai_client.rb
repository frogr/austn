module Harness
  module LLM
    class OpenAiClient < Client
      API_URL = "https://api.openai.com/v1/chat/completions"

      def initialize(api_key:, model:, max_tokens: 4096, logger: nil)
        @api_key = api_key
        @model = model
        @max_tokens = max_tokens
        @logger = logger
      end

      def complete(messages:, system: nil)
        user_content = messages.map(&:content).join("\n")

        if @logger
          @logger.log(
            provider: :openai,
            model: @model,
            system_prompt: system,
            user_prompt: user_content
          ) { do_complete(messages, system) }
        else
          do_complete(messages, system)
        end
      end

      private

      def do_complete(messages, system)
        body = build_body(messages, system)
        raw = post(body)
        parse_response(raw)
      end

      def build_body(messages, system)
        msgs = []
        msgs << { role: "system", content: system } if system
        msgs.concat(messages.map(&:to_h))

        {
          model: @model,
          max_tokens: @max_tokens,
          messages: msgs,
          response_format: { type: "json_object" }
        }.to_json
      end

      def post(body)
        uri = URI(API_URL)
        request = Net::HTTP::Post.new(uri)
        request["Content-Type"] = "application/json"
        request["Authorization"] = "Bearer #{@api_key}"
        request.body = body

        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
          http.request(request)
        end

        JSON.parse(response.body, symbolize_names: true)
      end

      def parse_response(raw)
        Response.new(
          content: raw.dig(:choices, 0, :message, :content) || "",
          model: raw[:model] || @model,
          input_tokens: raw.dig(:usage, :prompt_tokens) || 0,
          output_tokens: raw.dig(:usage, :completion_tokens) || 0
        )
      end
    end
  end
end
