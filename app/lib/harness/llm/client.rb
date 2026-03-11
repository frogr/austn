module Harness
  module LLM
    class Client
      def complete(messages:, system: nil)
        raise NotImplementedError
      end
    end
  end
end
