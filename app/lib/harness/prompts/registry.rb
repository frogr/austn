module Harness
  module Prompts
    class Registry
      PROMPTS_DIR = File.expand_path(__dir__)

      def self.get(name)
        cache[name] ||= File.read(File.join(PROMPTS_DIR, "#{name}.txt"))
      end

      def self.cache
        @cache ||= {}
      end
    end
  end
end
