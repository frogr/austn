Rails.application.config.after_initialize do
  Harness.configure do |config|
    config.api_key = ENV["ANTHROPIC_API_KEY"]
    config.model = "claude-sonnet-4-20250514"
  end
end
