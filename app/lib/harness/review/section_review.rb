module Harness
  module Review
    class SectionReview
      def initialize(llm_client:)
        @llm = llm_client
      end

      def call(file_change:, context: "")
        prompt = build_prompt(file_change, context)
        response = @llm.complete(messages: [prompt], system: system_prompt)
        parse_findings(response.parsed_json, file_change.filename)
      end

      private

      def build_prompt(file_change, context)
        LLM::Prompt.new(
          role: :user,
          content: "File: #{file_change.filename} (#{file_change.language})\n" \
                   "Context: #{context}\n\nDiff:\n#{file_change.patch_text}"
        )
      end

      def system_prompt
        Prompts::Registry.get("section_review")
      end

      def parse_findings(data, filename)
        (data[:findings] || []).map do |f|
          Finding.new(
            severity: f[:severity].to_sym,
            title: f[:title],
            explanation: f[:explanation],
            file: filename,
            line_range: f[:line_range]
          )
        end
      end
    end
  end
end
