module Harness
  module Review
    class Pipeline
      def initialize(config: Harness.configuration)
        @config = config
        @llm = build_client
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

      def build_client
        client_class = @config.provider == :openai ? LLM::OpenAiClient : LLM::AnthropicClient
        client_class.new(
          api_key: @config.api_key,
          model: @config.model,
          max_tokens: @config.max_tokens_per_call
        )
      end

      def triage(file_changes, pr_description)
        Triage.new(llm_client: @llm).call(
          file_changes: file_changes,
          pr_description: pr_description
        )
      end

      def review_sections(prioritized)
        reviewable = prioritized[:high] + prioritized[:medium]
        reviewable.flat_map do |file_change|
          findings = SectionReview.new(llm_client: @llm).call(file_change: file_change)
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
