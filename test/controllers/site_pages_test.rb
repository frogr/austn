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

  test "an apostrophe in a page title is escaped once, in the title and the share tags" do
    get work_item_path("austn-net")

    assert_select "title", "austn.net's GPU tools · Austin French"
    assert_select "meta[property='og:title'][content=?]", "austn.net's GPU tools · Austin French"
    assert_not_includes response.body, "&amp;#39;"
  end

  test "the homepage links straight to the things that still run" do
    get root_path

    PlaygroundItem.all.select(&:live_path).each { |toy| assert_select "a.toy[href=?]", toy.live_path }
    assert_select "a[href=?]", playground_path
    assert_select "a[href=?]", book_path
  end

  test "the homepage says what happened at each job and asks for a call" do
    get root_path

    WorkItem.featured.each { |item| assert_select ".worklist-line", item.tagline }
    assert_select ".home-now a.button[href=?]", book_path
  end

  test "the work index lists jobs with a desk of photos, side projects as cards, fun with peeks" do
    get work_index_path

    WorkItem.of_kind("job").each { |item| assert_select ".worklist--index .worklist-title", item.title }
    job = WorkItem.of_kind("job").find(&:screenshot)
    assert_select ".jobs .desk .polaroid img[src=?]", job.screenshot
    assert_select ".jobs .desk .polaroid", count: WorkItem.of_kind("job").size
    project = WorkItem.of_kind("project").find(&:screenshot)
    assert_select ".cards .card-shot[src=?]", project.screenshot
    WorkItem.of_kind("fun").each { |item| assert_select ".funlist-title", item.title }
    fun = WorkItem.of_kind("fun").find(&:screenshot)
    assert_select ".funlist .has-peek .peek[src=?]", fun.screenshot
  end

  test "a case study leads with its numbers" do
    get work_item_path("backlit")

    WorkItem.find("backlit").stats.each { |stat| assert_select ".stats strong", stat["value"] }
  end

  test "the name is spelled out in the header everywhere except the homepage" do
    get root_path
    assert_select ".site-header .mark-name", count: 0

    get work_index_path
    assert_select ".site-header .mark-name", "Austin French"
  end
end
