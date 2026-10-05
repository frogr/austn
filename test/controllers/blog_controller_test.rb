require "test_helper"

class BlogControllerTest < ActionDispatch::IntegrationTest
  setup do
    @published = BlogPost.create!(title: "Published post", content: "Some **markdown** here.", slug: "published-post", published_at: 2.days.ago)
    @draft = BlogPost.create!(title: "Unpublished draft", content: "Not yet.", slug: "unpublished-draft", published_at: nil)
  end

  test "the index lists published posts only" do
    get blog_path

    assert_response :success
    assert_includes response.body, @published.title
    assert_not_includes response.body, @draft.title
  end

  test "a post renders its markdown on the server" do
    get blog_post_path(@published.slug)

    assert_response :success
    assert_select "article strong", "markdown"
  end

  test "a draft is not reachable by URL" do
    get blog_post_path(@draft.slug)
    assert_response :not_found
  end
end
