module Harness
  module LLM
    class Prompt
      attr_reader :role, :content

      def initialize(role:, content:)
        @role = role
        @content = content
      end

      def to_h
        { role: role.to_s, content: content }
      end
    end
  end
end
