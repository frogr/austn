require "test_helper"

class ReviewTest < ActiveSupport::TestCase
  test "valid with pr_url and status" do
    review = Review.new(pr_url: "https://github.com/owner/repo/pull/1", status: "pending")
    assert review.valid?
  end

  test "invalid without pr_url" do
    review = Review.new(status: "pending")
    assert_not review.valid?
  end

  test "invalid with bad status" do
    review = Review.new(pr_url: "https://github.com/owner/repo/pull/1", status: "invalid")
    assert_not review.valid?
  end

  test "has many review_sections" do
    review = reviews(:complete_review)
    assert_equal 1, review.review_sections.count
  end
end
