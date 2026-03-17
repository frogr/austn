require "test_helper"
require_relative "../../../../app/lib/harness/harness"

class Harness::Review::TriageTest < ActiveSupport::TestCase
  setup do
    @mock_llm = MockLLMClient.new
    @triage = Harness::Review::Triage.new(llm_client: @mock_llm)
  end

  test "classifies files by LLM response" do
    file1 = Harness::Diff::FileChange.new(filename: "app/models/user.rb", status: :modified, hunks: [])
    file2 = Harness::Diff::FileChange.new(filename: "README.md", status: :modified, hunks: [])

    @mock_llm.stub_response({
      files: [
        { filename: "app/models/user.rb", priority: "high", reason: "Core model" },
        { filename: "README.md", priority: "low", reason: "Documentation" }
      ]
    })

    result = @triage.call(file_changes: [ file1, file2 ])
    assert_equal 1, result[:high].length
    assert_equal 0, result[:medium].length
    assert_equal 1, result[:low].length
    assert_equal "app/models/user.rb", result[:high].first.filename
  end

  test "defaults to low priority when file not in LLM response" do
    file = Harness::Diff::FileChange.new(filename: "unknown.txt", status: :modified, hunks: [])

    @mock_llm.stub_response({ files: [] })

    result = @triage.call(file_changes: [ file ])
    assert_equal 1, result[:low].length
  end

  class MockLLMClient < Harness::LLM::Client
    def stub_response(json_data)
      @response_data = json_data
    end

    def complete(messages:, system: nil)
      Harness::LLM::Response.new(
        content: JSON.generate(@response_data),
        model: "test"
      )
    end
  end
end
