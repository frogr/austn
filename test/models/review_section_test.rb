require "test_helper"

class ReviewSectionTest < ActiveSupport::TestCase
  test "valid with filename and review" do
    section = ReviewSection.new(
      review: reviews(:complete_review),
      filename: "test.rb",
      status: "pending"
    )
    assert section.valid?
  end

  test "invalid without filename" do
    section = ReviewSection.new(review: reviews(:complete_review), status: "pending")
    assert_not section.valid?
  end

  test "belongs to review" do
    section = review_sections(:user_model_section)
    assert_equal reviews(:complete_review), section.review
  end
end
