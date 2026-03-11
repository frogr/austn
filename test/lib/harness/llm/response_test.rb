require "test_helper"
require_relative "../../../../app/lib/harness/harness"

class Harness::LLM::ResponseTest < ActiveSupport::TestCase
  test "stores content and metadata" do
    response = Harness::LLM::Response.new(
      content: "Hello", model: "claude-3", input_tokens: 10, output_tokens: 5
    )
    assert_equal "Hello", response.content
    assert_equal "claude-3", response.model
    assert_equal 10, response.input_tokens
    assert_equal 5, response.output_tokens
  end

  test "parsed_json returns symbolized hash" do
    response = Harness::LLM::Response.new(
      content: '{"key": "value", "nested": {"a": 1}}',
      model: "test"
    )
    result = response.parsed_json
    assert_equal "value", result[:key]
    assert_equal 1, result[:nested][:a]
  end

  test "defaults token counts to zero" do
    response = Harness::LLM::Response.new(content: "hi", model: "test")
    assert_equal 0, response.input_tokens
    assert_equal 0, response.output_tokens
  end
end
