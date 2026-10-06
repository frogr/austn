module Gpu
  # A failure that is safe to show a visitor: a stable code and a plain
  # sentence. The exception behind it is logged, never sent to the browser.
  class PublicError
    MESSAGES = {
      gpu_offline: "The GPU box is offline right now, so this tool can't run.",
      timeout: "That took too long and was stopped. Try a smaller input.",
      invalid_input: "That input can't be processed. Check it and try again.",
      generation_failed: "Something went wrong while generating. Try again later."
    }.freeze

    attr_reader :code, :message

    def self.for(exception)
      case exception
      when Offline, ConnectionError then new(:gpu_offline)
      when Timeout then new(:timeout)
      else new(:generation_failed)
      end
    end

    def initialize(code, message = MESSAGES.fetch(code))
      @code = code
      @message = message
    end

    # Merged into JSON responses and job status payloads.
    def to_h
      { error_code: code.to_s, error: message }
    end
  end
end
