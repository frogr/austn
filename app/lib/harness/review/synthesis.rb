module Harness
  module Review
    class Synthesis
      def initialize(llm_client:)
        @llm = llm_client
      end

      def call(findings:, human_comments: [])
        prompt = build_prompt(findings, human_comments)
        response = @llm.complete(messages: [prompt], system: system_prompt)
        response.parsed_json
      end

      private

      def build_prompt(findings, human_comments)
        findings_text = findings.map { |f| format_finding(f) }.join("\n\n")
        comments_text = human_comments.map { |c| "Human: #{c}" }.join("\n")

        LLM::Prompt.new(
          role: :user,
          content: "Findings:\n#{findings_text}\n\nHuman Comments:\n#{comments_text}"
        )
      end

      def format_finding(finding)
        "[#{finding.severity}] #{finding.title} (#{finding.file})\n#{finding.explanation}"
      end

      def system_prompt
        Prompts::Registry.get("synthesis")
      end
    end
  end
end
