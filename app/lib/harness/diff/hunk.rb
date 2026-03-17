module Harness
  module Diff
    class Hunk
      attr_reader :header, :lines, :old_start, :new_start

      def initialize(header:, lines:)
        @header = header
        @lines = lines
        @old_start, @new_start = parse_header
      end

      def additions
        lines.select { |l| l.start_with?("+") }
      end

      def deletions
        lines.select { |l| l.start_with?("-") }
      end

      def to_s
        [ header, *lines ].join("\n")
      end

      private

      def parse_header
        match = header.match(/@@ -(\d+)(?:,\d+)? \+(\d+)/)
        [ match[1].to_i, match[2].to_i ]
      end
    end
  end
end
