require "test_helper"
require_relative "../../../../app/lib/harness/harness"

class Harness::Review::SectionReviewTest < ActiveSupport::TestCase
  setup do
    @mock_llm = MockLLMClient.new
    @reviewer = Harness::Review::SectionReview.new(llm_client: @mock_llm)
  end

  test "parses findings from LLM response" do
    hunk = Harness::Diff::Hunk.new(header: "@@ -1,3 +1,4 @@", lines: ["+new line"])
    file = Harness::Diff::FileChange.new(filename: "app/models/user.rb", status: :modified, hunks: [hunk])

    @mock_llm.stub_response({
      walkthrough: "Adds a validation to user model",
      findings: [
        {
          severity: "warning",
          title: "Missing test",
          explanation: "No test covers this validation",
          line_range: "L2"
        }
      ]
    })

    findings = @reviewer.call(file_change: file)
    assert_equal 1, findings.length
    assert_equal :warning, findings.first.severity
    assert_equal "Missing test", findings.first.title
    assert_equal "app/models/user.rb", findings.first.file
  end

  test "returns empty array when no findings" do
    file = Harness::Diff::FileChange.new(filename: "README.md", status: :modified, hunks: [])

    @mock_llm.stub_response({ walkthrough: "Updated docs", findings: [] })

    findings = @reviewer.call(file_change: file)
    assert_empty findings
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
