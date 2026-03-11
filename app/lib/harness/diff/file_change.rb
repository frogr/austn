module Harness
  module Diff
    class FileChange
      attr_reader :filename, :status, :hunks, :language

      def initialize(filename:, status:, hunks:, language: nil)
        @filename = filename
        @status = status
        @hunks = hunks
        @language = language || detect_language
      end

      def patch_text
        hunks.map(&:to_s).join("\n")
      end

      private

      def detect_language
        ext = File.extname(filename).delete(".")
        EXTENSION_MAP.fetch(ext, "text")
      end

      EXTENSION_MAP = {
        "rb" => "ruby", "js" => "javascript", "jsx" => "javascript",
        "ts" => "typescript", "tsx" => "typescript", "py" => "python",
        "go" => "go", "rs" => "rust", "ex" => "elixir", "exs" => "elixir",
        "java" => "java", "kt" => "kotlin", "swift" => "swift",
        "css" => "css", "html" => "html", "yml" => "yaml", "yaml" => "yaml",
        "json" => "json", "md" => "markdown", "sql" => "sql"
      }.freeze
    end
  end
end
