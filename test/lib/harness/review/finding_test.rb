require "test_helper"

class Harness::Review::FindingTest < ActiveSupport::TestCase
  test "creates finding with valid severity" do
    finding = Harness::Review::Finding.new(
      severity: :warning,
      title: "Missing null check",
      explanation: "The method doesn't handle nil input"
    )
    assert_equal :warning, finding.severity
    assert_equal "Missing null check", finding.title
  end

  test "raises on invalid severity" do
    assert_raises(ArgumentError) do
      Harness::Review::Finding.new(
        severity: :critical,
        title: "Bad",
        explanation: "Very bad"
      )
    end
  end

  test "accepts optional file and line_range" do
    finding = Harness::Review::Finding.new(
      severity: :info,
      title: "Style nit",
      explanation: "Consider renaming",
      file: "app/models/user.rb",
      line_range: "L12-L15"
    )
    assert_equal "app/models/user.rb", finding.file
    assert_equal "L12-L15", finding.line_range
  end

  test "all valid severities are accepted" do
    %i[info warning red_flag].each do |sev|
      finding = Harness::Review::Finding.new(
        severity: sev, title: "Test", explanation: "Test"
      )
      assert_equal sev, finding.severity
    end
  end
end
