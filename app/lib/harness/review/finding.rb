module Harness
  module Review
    class Finding
      SEVERITIES = %i[info warning red_flag].freeze

      attr_reader :severity, :title, :explanation, :file, :line_range

      def initialize(severity:, title:, explanation:, file: nil, line_range: nil)
        raise ArgumentError, "Invalid severity" unless SEVERITIES.include?(severity)
        @severity = severity
        @title = title
        @explanation = explanation
        @file = file
        @line_range = line_range
      end
    end
  end
end
