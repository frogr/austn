require "test_helper"

class Admin::AnalyticsControllerTest < ActionDispatch::IntegrationTest
  CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
  IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"

  # Two people: one from LinkedIn who reads the hire page, tries a demo and
  # books; one direct on a phone who only reads a post.
  def visit_as_two_people
    linkedin = { "User-Agent" => CHROME, "REMOTE_ADDR" => "203.0.113.9" }
    get hire_path, headers: linkedin.merge("Referer" => "https://www.linkedin.com/")
    get work_item_path("gutenberg-mcp"), headers: linkedin.merge("Referer" => "https://www.example.com/hire")
    get go_path("demo", "gutenberg-mcp"), headers: linkedin.merge("Referer" => "https://www.example.com/work/gutenberg-mcp")
    get book_path, headers: linkedin
    avail = availabilities(:next_week)
    post bookings_path, params: { booked_date: avail.date.to_s, start_time: "09:00", first_name: "Test", email: "test@example.com", phone_number: "5551234567" }, headers: linkedin.merge("Referer" => "https://www.example.com/book/#{avail.date}")
    Visit.last.update_columns(city: "Brooklyn", country: "United States", org: "Verizon")

    get blog_path, headers: { "User-Agent" => IPHONE, "REMOTE_ADDR" => "198.51.100.7" }
  end

  test "needs an admin" do
    get admin_analytics_path
    assert_redirected_to admin_login_path
  end

  test "the report shows who came, from where and what they did" do
    visit_as_two_people
    sign_in_as_admin

    get admin_analytics_path
    assert_response :success
    assert_select ".stats-grid p.text-2xl", text: "2" # visitors
    assert_select "h3", text: "Sources"
    assert_select "li", text: /linkedin \/ social\s+1/
    assert_select "li", text: /direct\s+1/
    assert_select "li", text: %r{/hire\s+\(1 visits\)\s+1}
    assert_select "li", text: /demo\/gutenberg-mcp\s+1/
    assert_select "li", text: /Brooklyn, United States\s+1/
    assert_select "li", text: /phone\s+1/
    assert_select ".funnel li", count: VisitReport::HIRE_FUNNEL.size
    assert_select ".funnel li", text: /1\s+Booked a call/
    assert_select ".recent-visits tbody tr", count: 2
    assert_select ".recent-visits td", text: %r{/hire → /work/gutenberg-mcp → /book}
  end

  test "the range and the hire filter narrow the report" do
    visit_as_two_people
    sign_in_as_admin

    get admin_analytics_path(days: 7, touching: "/hire")
    assert_select ".recent-visits tbody tr", count: 1
    assert_select "nav[aria-label=Range] a.text-white", text: "7 days"

    get admin_analytics_path(days: "bogus", touching: "javascript:alert(1)")
    assert_response :success
    assert_select ".recent-visits tbody tr", count: 2
  end

  test "a visit page lists each thing the person did" do
    visit_as_two_people
    sign_in_as_admin

    get admin_analytics_visit_path(Visit.first)
    assert_response :success
    assert_select ".visit-facts dd", text: /linkedin \/ social/
    assert_select ".visit-facts dd", text: "203.0.113.9"
    assert_select ".visit-events li", count: 5
    assert_select ".visit-events li", text: %r{Viewed /work/gutenberg-mcp\s+from /hire}
    assert_select ".visit-events li", text: %r{Left for demo/gutenberg-mcp}
    assert_select ".visit-events li", text: /booked a call/
  end

  test "the report is empty but fine with no visits" do
    sign_in_as_admin
    get admin_analytics_path
    assert_response :success
    assert_select "p", text: "No visits in this range."
  end

  test "the dashboard links to it" do
    sign_in_as_admin
    get admin_root_path
    assert_select "a[href=?]", admin_analytics_path
  end
end
