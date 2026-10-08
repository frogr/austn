require "test_helper"

class HireAndCoursePagesTest < ActionDispatch::IntegrationTest
  test "the hire page sells every offer with its pitch, what you get and the examples" do
    get hire_path

    assert_response :success
    assert_select "h1", "Hire me"
    Offer.all.each do |offer|
      assert_select "section##{offer.slug} h2", offer.title
      assert_select "section##{offer.slug} .offer-pitch", offer.pitch
      assert_select "section##{offer.slug} .checks li", count: offer.you_get.size
      offer.examples.each { |item| assert_select "section##{offer.slug} .offer-examples a.example-title[href=?]", work_item_path(item) }
      assert_select ".offers .offer-card[href=?]", "##{offer.slug}", text: /#{Regexp.escape(offer.title)}/
    end
    assert_select "#mcp-server .stats strong", text: "3 days"
    assert_select "#mcp-server .stats strong", text: "7 days"
    assert_select "#eval-sprint .offer-time", "One week"
    assert_select ".offer-pricing", text: /agreed in writing/, minimum: 1
    assert_select "section.offer:not(#course)", text: /\$\d/, count: 0 # only the course carries a price
    assert_select "#eval-sprint .offer-examples a[href=?]", course_path("evals-in-production")
    assert_select "#how-i-work h3", count: Offer.how_i_work.size
    assert_select "#how-i-work .diagram svg"
    assert_select ".offers .offer-card .offer-card-price", text: "3 to 7 days"
    assert_select ".offers .offer-card--course[href='#course']", /Evals in Production/
    assert_select "#course a[href=?]", course_path("evals-in-production")
    assert_select ".offer-examples a.button[href=?]", WorkItem.find("gutenberg-mcp").demo_url, text: "Try it live"
    assert_select "section.offer", text: /not verified/i, count: 0
    assert_select "a.button[href=?]", book_path
    assert_select "a[href=?]", "mailto:#{Profile.email}"
  end

  test "marketplace profiles appear in the rail only when the file lists them" do
    get hire_path
    assert_select ".rail", text: /Packaged versions/, count: 0

    Offer.stub(:profiles, [ { "label" => "Fiverr", "url" => "https://www.fiverr.com/example" } ]) do
      get hire_path
      assert_select ".rail a[href=?]", "https://www.fiverr.com/example", text: "Fiverr"
      assert_select ".offer-pricing a[href=?]", "https://www.fiverr.com/example"
    end
  end

  test "the course page points at the sprint for people who want it done for them" do
    get course_path("evals-in-production")
    assert_select "a[href=?]", hire_path(anchor: "eval-sprint")
  end

  test "the footer links to the hire page" do
    get work_index_path
    assert_select ".site-footer a[href=?]", hire_path
  end

  test "the course page shows the lessons and the free starter" do
    course = Course.find("evals-in-production")

    get course_path(course)

    assert_response :success
    assert_select "h1", course.title
    assert_select ".lessons li", count: 6
    course.lessons.each { |lesson| assert_select ".lessons strong", "#{lesson["title"]}." }
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
    assert_select ".course-price", count: 0
    assert_not_includes response.body, "$#{course.price}"
  end

  test "the hire page shows the course price only once it is on sale" do
    course = Course.find("evals-in-production")
    assert_not course.on_sale?, "set buy_url in content/courses.yml and update this test"

    get hire_path
    assert_select ".offer-card--course .offer-card-price", "Launching soon"
    assert_select "#course .offer-pitch", /Launching soon/
    assert_not_includes response.body, "$#{course.price}"

    on_sale = Course.new(course.attributes.merge("buy_url" => "https://example.gumroad.com/l/evals-in-production"))
    Course.stub(:find, on_sale) do
      get hire_path
    end
    assert_select ".offer-card--course .offer-card-price", "$39"
    assert_select "#course .offer-pitch", /\$39/
  end

  test "every example on the hire page has a drawing" do
    get hire_path
    Offer.all.each do |offer|
      offer.examples.each { |item| assert item.art?, "#{item.slug} has no drawing; add one to shared/_toy_art" }
    end
    assert_select ".offer-examples .mini-art", minimum: Offer.all.sum { |offer| offer.examples.size }
  end

  test "with a buy_url the course has a buy button that goes there" do
    url = "https://example.gumroad.com/l/evals-in-production"
    course = Course.new(Course.find("evals-in-production").attributes.merge("buy_url" => url))

    Course.stub(:find, course) do
      get course_path("evals-in-production")
    end

    assert_select "a.course-buy[href=?]", url, text: "Buy for $39"
    assert_select ".course-price", /\$39 early access, then \$59/
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
