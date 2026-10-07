require "test_helper"

class CourseTest < ActiveSupport::TestCase
  test "Evals in Production has six lessons and its early access price" do
    course = Course.find("evals-in-production")

    assert_equal 6, course.lessons.size
    course.lessons.each { |lesson| assert lesson["title"].present? && lesson["line"].present? && lesson["code"].present? }
    assert_equal 39, course.price
    assert_equal 59, course.regular_price
  end

  test "a blank buy_url means the course isn't on sale yet" do
    assert_not Course.new("buy_url" => "").on_sale?
    assert_not Course.new("buy_url" => nil).on_sale?
    assert Course.new("buy_url" => "https://example.gumroad.com/l/evals").on_sale?
  end

  test "only https links are used, anything else counts as missing" do
    assert_nil Course.new("buy_url" => "javascript:alert(1)").buy_url
    assert_nil Course.new("buy_url" => "http://example.com/buy").buy_url
    assert_nil Course.new("buy_url" => "https://exa mple.com").buy_url
    assert_nil Course.new("starter_url" => "ftp://example.com").starter_url
    assert_equal "https://github.com/frogr/llm-eval-starter", Course.find("evals-in-production").starter_url
  end

  test "the sample lesson only counts once its post is published" do
    course = Course.new("sample_post" => "sample-lesson")
    assert_nil course.sample_post

    post = BlogPost.create!(title: "Sample", content: "Hello", slug: "sample-lesson", published_at: nil)
    assert_nil course.sample_post

    post.update!(published_at: 1.hour.ago)
    assert_equal post, course.sample_post
  end

  test "an unknown course is not found" do
    assert_raises(ActiveRecord::RecordNotFound) { Course.find("nope") }
  end
end
