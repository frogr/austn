module Harness
  class Configuration
    attr_accessor :provider, :api_key, :model, :max_tokens_per_call,
                  :on_section_complete

    def initialize
      @provider = :openai
      @model = "gpt-4o-mini"
      @max_tokens_per_call = 4096
      @on_section_complete = nil
    end
  end
end
