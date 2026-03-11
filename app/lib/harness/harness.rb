require "json"
require "net/http"
require "uri"

module Harness
  class Error < StandardError; end

  class << self
    attr_accessor :configuration

    def configure
      self.configuration ||= Configuration.new
      yield(configuration)
    end
  end
end

require_relative "configuration"
require_relative "diff/hunk"
require_relative "diff/file_change"
require_relative "diff/parser"
require_relative "diff/fetcher"
require_relative "llm/prompt"
require_relative "llm/response"
require_relative "llm/client"
require_relative "llm/anthropic_client"
require_relative "prompts/registry"
require_relative "review/finding"
require_relative "review/triage"
require_relative "review/section_review"
require_relative "review/synthesis"
require_relative "review/pipeline"
