require "test_helper"

class Harness::ConfigurationTest < ActiveSupport::TestCase
  test "has sensible defaults" do
    config = Harness::Configuration.new
    assert_equal :anthropic, config.provider
    assert_equal "claude-sonnet-4-20250514", config.model
    assert_equal 4096, config.max_tokens_per_call
    assert_nil config.on_section_complete
  end

  test "configure block sets values" do
    original = Harness.configuration

    Harness.configure do |c|
      c.api_key = "test-key"
      c.model = "test-model"
    end

    assert_equal "test-key", Harness.configuration.api_key
    assert_equal "test-model", Harness.configuration.model
  ensure
    Harness.configuration = original
  end
end
