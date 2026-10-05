require "test_helper"

class SitePagesTest < ActionDispatch::IntegrationTest
  test "the homepage leads with the headline and the featured work" do
    get root_path

    assert_response :success
    assert_select "h1", Profile.full_name
    assert_select ".eyebrow", /#{Regexp.escape(Profile.headline)}/
    WorkItem.featured.each { |item| assert_select "a[href=?]", work_item_path(item) }
  end

  test "every page in the nav renders" do
    [ work_index_path, blog_path, playground_path, resume_path, now_path ].each do |path|
      get path
      assert_response :success, "#{path} did not render"
    end
  end

  test "every case study and playground page renders" do
    WorkItem.all.each do |item|
      get work_item_path(item)
      assert_response :success, "#{item.slug} did not render"
      assert_select "h1", item.title
    end

    PlaygroundItem.all.each do |item|
      get playground_item_path(item)
      assert_response :success, "#{item.slug} did not render"
    end
  end

  test "an unknown case study is a real 404" do
    get work_item_path("not-a-project")
    assert_response :not_found
  end

  test "old project URLs land on the matching case study" do
    get "/projects/pages-ai"
    assert_redirected_to work_item_path("companycam")
    assert_response :moved_permanently

    get "/projects/bgca"
    assert_redirected_to work_item_path("backlit")

    get "/projects/hub"
    assert_redirected_to work_index_path
  end

  test "old side pages redirect to their new homes" do
    { "/projects" => "/work", "/fun-links" => "/now", "/reading" => "/now", "/resources" => "/now", "/meet" => "/book",
      "/tech-setup" => "/now", "/video" => "/playground", "/endless" => "/playground", "/endless/stories/1" => "/playground" }.each do |from, to|
      get from
      assert_redirected_to to
    end
  end

  test "the resume renders as a page and as a PDF without the phone number" do
    get resume_path
    assert_response :success
    assert_includes response.body, "Tenex"
    assert_no_match(/\(\d{3}\) \d{3}-\d{4}/, response.body)

    get resume_path(format: :pdf)
    assert_response :success
    assert_equal "application/pdf", response.media_type
    assert response.body.start_with?("%PDF")
  end

  test "the sitemap lists case studies and published posts" do
    post = BlogPost.create!(title: "Live", content: "Hello", slug: "live", published_at: 1.day.ago)
    BlogPost.create!(title: "Draft", content: "Hello", slug: "draft-post", published_at: nil)

    get sitemap_path(format: :xml)

    assert_response :success
    assert_includes response.body, work_item_path("tenex")
    assert_includes response.body, blog_post_path(post.slug)
    assert_not_includes response.body, "draft-post"
  end

  test "pages use the site's own title, not the old one" do
    get root_path
    assert_select "title", "Austin French · #{Profile.headline}"
    assert_not_includes response.body, "Senior Backend Engineer"
  end
end
