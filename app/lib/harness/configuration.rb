module Harness
  class Configuration
    attr_accessor :provider, :api_key, :model, :max_tokens_per_call,
                  :on_section_complete

    def initialize
      @provider = :anthropic
      @model = "claude-sonnet-4-20250514"
      @max_tokens_per_call = 4096
      @on_section_complete = nil
    end
  end
end
