module Harness
  module Review
    class Triage
      def initialize(llm_client:)
        @llm = llm_client
      end

      def call(file_changes:, pr_description: "")
        prompt = build_prompt(file_changes, pr_description)
        response = @llm.complete(messages: [prompt], system: system_prompt)
        classify(file_changes, response.parsed_json)
      end

      private

      def build_prompt(file_changes, pr_description)
        summary = file_changes.map { |fc| "#{fc.status}: #{fc.filename}" }.join("\n")
        LLM::Prompt.new(
          role: :user,
          content: "PR Description:\n#{pr_description}\n\nFiles changed:\n#{summary}"
        )
      end

      def system_prompt
        Prompts::Registry.get("triage")
      end

      def classify(file_changes, priorities)
        grouped = file_changes.group_by do |fc|
          priority = priorities[:files]&.find { |f| f[:filename] == fc.filename }
          priority ? priority[:priority].to_sym : :low
        end
        { high: grouped[:high] || [], medium: grouped[:medium] || [], low: grouped[:low] || [] }
      end
    end
  end
end
