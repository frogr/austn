require_relative "../../app/lib/harness/harness"

Harness.configure do |config|
  config.api_key = ENV["ANTHROPIC_API_KEY"]
  config.model = "claude-sonnet-4-20250514"
end
