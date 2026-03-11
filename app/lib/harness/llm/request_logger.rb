module Harness
  module LLM
    class RequestLogger
      attr_reader :review_id, :request_type

      def initialize(review_id: nil, request_type: nil)
        @review_id = review_id
        @request_type = request_type
      end

      def log(provider:, model:, system_prompt:, user_prompt:, &block)
        record = HarnessRequest.create!(
          review_id: review_id,
          request_type: request_type,
          provider: provider.to_s,
          model: model,
          status: HarnessRequest::PENDING,
          system_prompt: truncate_for_storage(system_prompt),
          user_prompt: truncate_for_storage(user_prompt)
        )

        started_at = Time.current
        response = block.call
        duration = Time.current - started_at

        record.update!(
          status: HarnessRequest::SUCCESS,
          raw_response: truncate_for_storage(response.content),
          input_tokens: response.input_tokens,
          output_tokens: response.output_tokens,
          duration_seconds: duration,
          estimated_cost: compute_cost(model, response.input_tokens, response.output_tokens)
        )

        response
      rescue StandardError => e
        duration = started_at ? Time.current - started_at : 0
        record&.update!(
          status: HarnessRequest::ERROR,
          error_message: e.message,
          duration_seconds: duration
        )
        raise
      end

      private

      def truncate_for_storage(text)
        return nil if text.nil?
        text.to_s[0..50_000]
      end

      def compute_cost(model, input_tokens, output_tokens)
        pricing = HarnessRequest::PRICING[model] || HarnessRequest::PRICING["gpt-4o-mini"]
        input_cost = (input_tokens / 1_000_000.0) * pricing[:input]
        output_cost = (output_tokens / 1_000_000.0) * pricing[:output]
        input_cost + output_cost
      end
    end
  end
end
