module Harness
  module LLM
    class Response
      attr_reader :content, :model, :input_tokens, :output_tokens

      def initialize(content:, model:, input_tokens: 0, output_tokens: 0)
        @content = content
        @model = model
        @input_tokens = input_tokens
        @output_tokens = output_tokens
      end

      def parsed_json
        JSON.parse(content, symbolize_names: true)
      end
    end
  end
end
