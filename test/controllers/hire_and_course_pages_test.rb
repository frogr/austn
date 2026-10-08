require "test_helper"

class HireAndCoursePagesTest < ActionDispatch::IntegrationTest
  test "the hire page lists every offer with its proof and asks for a call" do
    get hire_path

    assert_response :success
    assert_select "h1", "Hire me"
    Offer.all.each do |offer|
      assert_select "section##{offer.slug} h2", offer.title
      offer.proof.each { |item| assert_select "section##{offer.slug} .offer-proof a[href=?]", work_item_path(item) }
    end
    assert_select "#mcp-server .stats strong", text: "$150"
    assert_select "#mcp-server .stats strong", text: "$350"
    assert_select "#mcp-server .stats strong", text: "$750"
    assert_select "#mcp-server > p", /None of them is deployed or has sign-in yet/
    assert_select "#eval-sprint .offer-price", "$750"
    assert_select "#eval-sprint .offer-proof a[href=?]", course_path("evals-in-production")
    assert_select "#how-i-work h3", count: Offer.how_i_work.size
    assert_select "a.button[href=?]", book_path
    assert_select "a[href=?]", "mailto:#{Profile.email}"
  end

  test "an offer without a price says it's scoped per project" do
    rag = Offer.all.find { |offer| offer.slug == "rag" }
    priced = Offer.new(rag.attributes.merge("from_price" => 1500))

    Offer.stub(:all, [ Offer.new(rag.attributes.merge("from_price" => nil)) ]) do
      get hire_path
      assert_select "#rag .offer-price", "Scoped per project"
    end

    Offer.stub(:all, [ priced ]) do
      get hire_path
      assert_select "#rag .offer-price", "from $1,500"
    end
  end

  test "the footer links to the hire page" do
    get work_index_path
    assert_select ".site-footer a[href=?]", hire_path
  end

  test "the course page shows the lessons, the price and the free starter" do
    course = Course.find("evals-in-production")

    get course_path(course)

    assert_response :success
    assert_select "h1", course.title
    assert_select ".lessons li", count: 6
    course.lessons.each { |lesson| assert_select ".lessons strong", "#{lesson["title"]}." }
    assert_select ".course-price", /\$39 early access, then \$59/
    assert_select "a[href=?]", course.starter_url
    assert_select "li", /Modules 2, 4 and 5 can also call Anthropic or OpenAI/
    assert_select "p", /TypeScript \(five modules\) and Ruby for the Rails module/
  end

  test "with no buy_url the course says it's launching soon and offers an email, not a buy link" do
    course = Course.new(Course.find("evals-in-production").attributes.merge("buy_url" => ""))

    Course.stub(:find, course) do
      get course_path("evals-in-production")
    end

    assert_select ".course-soon", /Launching soon/
    assert_select ".course-soon a[href^=?]", "mailto:#{Profile.email}"
    assert_select ".course-buy", count: 0
  end

  test "with a buy_url the course has a buy button that goes there" do
    url = "https://example.gumroad.com/l/evals-in-production"
    course = Course.new(Course.find("evals-in-production").attributes.merge("buy_url" => url))

    Course.stub(:find, course) do
      get course_path("evals-in-production")
    end

    assert_select "a.course-buy[href=?]", url, text: "Buy for $39"
    assert_select ".course-soon", count: 0
  end

  test "the lesson 1 sample is linked only once its post is published" do
    get course_path("evals-in-production")
    assert_select "a", text: "Read lesson 1 free", count: 0

    post = BlogPost.create!(title: "Golden sets from production logs", content: "Lesson 1", slug: "golden-sets-from-production-logs", published_at: 1.hour.ago)
    get course_path("evals-in-production")
    assert_select "a[href=?]", blog_post_path(post.slug), text: "Read lesson 1 free"
  end

  test "an unknown course is a real 404" do
    get course_path("not-a-course")
    assert_response :not_found
  end

  test "the sitemap lists the hire page and the course" do
    get sitemap_path(format: :xml)
    assert_includes response.body, "https://austn.net/hire"
    assert_includes response.body, "https://austn.net/courses/evals-in-production"
  end
end
