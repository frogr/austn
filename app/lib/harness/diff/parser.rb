module Harness
  module Diff
    class Parser
      def call(raw_diff)
        split_into_files(raw_diff).map { |chunk| parse_file(chunk) }
      end

      private

      def split_into_files(raw_diff)
        raw_diff.split(/^diff --git /).reject(&:empty?)
      end

      def parse_file(chunk)
        lines = chunk.lines
        filename = extract_filename(lines.first)
        status = detect_status(lines)
        hunks = extract_hunks(lines)

        FileChange.new(filename: filename, status: status, hunks: hunks)
      end

      def extract_filename(header_line)
        header_line.match(%r{b/(.+)})[1].strip
      end

      def detect_status(lines)
        return :added if lines.any? { |l| l.start_with?("new file") }
        return :deleted if lines.any? { |l| l.start_with?("deleted file") }
        return :renamed if lines.any? { |l| l.start_with?("rename from") }
        :modified
      end

      def extract_hunks(lines)
        chunks = lines.slice_before(/^@@/).reject { |c| !c.first.start_with?("@@") }
        chunks.map { |c| Hunk.new(header: c.first.strip, lines: c[1..]) }
      end
    end
  end
end
