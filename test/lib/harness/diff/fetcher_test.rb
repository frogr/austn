require "test_helper"
require_relative "../../../../app/lib/harness/harness"

class Harness::Diff::FetcherTest < ActiveSupport::TestCase
  setup do
    @fetcher = Harness::Diff::Fetcher.new
  end

  test "raises error for invalid URL" do
    assert_raises(Harness::Error) do
      @fetcher.call("https://example.com/not-a-pr")
    end
  end

  test "raises error for non-github URL" do
    assert_raises(Harness::Error) do
      @fetcher.call("https://gitlab.com/owner/repo/pull/123")
    end
  end

  test "parses valid github PR URL" do
    # Test the URL parsing without making an actual API call
    url = "https://github.com/rails/rails/pull/12345"
    match = url.match(Harness::Diff::Fetcher::GITHUB_PR_PATTERN)
    assert_equal "rails", match[1]
    assert_equal "rails", match[2]
    assert_equal "12345", match[3]
  end
end
