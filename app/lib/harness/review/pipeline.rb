module Harness
  module Review
    class Pipeline
      MAX_FILES_TO_REVIEW = 15
      MAX_DIFF_CHARS = 12_000

      def initialize(config: Harness.configuration, review_id: nil)
        @config = config
        @review_id = review_id
        @fetcher = Diff::Fetcher.new
        @parser = Diff::Parser.new
      end

      def call(pr_url:, pr_description: "")
        raw_diff = @fetcher.call(pr_url)
        file_changes = @parser.call(raw_diff)
        prioritized = triage(file_changes, pr_description)
        findings = review_sections(prioritized)
        notify_complete(findings)
        findings
      end

      private

      def build_client(request_type)
        logger = LLM::RequestLogger.new(review_id: @review_id, request_type: request_type)
        client_class = @config.provider == :openai ? LLM::OpenAiClient : LLM::AnthropicClient
        client_class.new(
          api_key: @config.api_key,
          model: @config.model,
          max_tokens: @config.max_tokens_per_call,
          logger: logger
        )
      end

      def triage(file_changes, pr_description)
        llm = build_client("triage")
        Triage.new(llm_client: llm).call(
          file_changes: file_changes,
          pr_description: pr_description
        )
      end

      def review_sections(prioritized)
        reviewable = (prioritized[:high] + prioritized[:medium]).first(MAX_FILES_TO_REVIEW)

        reviewable.flat_map do |file_change|
          llm = build_client("section_review")
          findings = SectionReview.new(llm_client: llm, max_diff_chars: MAX_DIFF_CHARS)
                       .call(file_change: file_change)
          notify_section(file_change, findings)
          findings
        end
      end

      def notify_section(file_change, findings)
        return unless @config.on_section_complete
        @config.on_section_complete.call(file: file_change, findings: findings)
      end

      def notify_complete(findings)
        # Hook point for future use
      end
    end
  end
end
