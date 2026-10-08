require "test_helper"

# Page views, outbound clicks and bookings are recorded server-side.
class VisitTrackingTest < ActionDispatch::IntegrationTest
  CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

  setup { @headers = { "User-Agent" => CHROME, "REMOTE_ADDR" => "203.0.113.9" } }

  test "a page view starts a visit with its attribution" do
    get hire_path(ref: "resume"), headers: @headers.merge("Referer" => "https://www.linkedin.com/in/someone")

    assert_response :success
    visit = Visit.last
    assert_equal "/hire", visit.landing_path
    assert_equal "resume", visit.ref
    assert_equal "linkedin.com", visit.referrer_host
    assert_equal [ "/hire" ], visit.paths
    assert_equal 1, visit.page_views_count
  end

  test "the next page on the same visit records where it came from" do
    get hire_path, headers: @headers
    get work_item_path("gutenberg-mcp"), headers: @headers.merge("Referer" => "https://www.example.com/hire")

    assert_equal 1, Visit.count
    event = Visit.last.events.page_views.last
    assert_equal "/work/gutenberg-mcp", event.path
    assert_equal "/hire", event.referrer_path
  end

  test "crawlers, missing pages, admin pages and Austin signed in are not counted" do
    get hire_path, headers: @headers.merge("User-Agent" => "Mozilla/5.0 (compatible; bingbot/2.0)")
    get work_item_path("no-such-thing"), headers: @headers
    get sitemap_path(format: :xml), headers: @headers
    assert_equal 0, Visit.count

    sign_in_as_admin
    get admin_root_path, headers: @headers
    get hire_path, headers: @headers
    assert_equal 0, Visit.count
  end

  test "a visit that cannot be saved does not break the page" do
    Visit.stub(:for_request, ->(*) { raise ActiveRecord::StatementInvalid, "database went away" }) do
      get hire_path, headers: @headers
    end
    assert_response :success
  end

  test "a booking is recorded as an action on the visit" do
    avail = availabilities(:next_week)
    get book_date_path(date: avail.date.to_s), headers: @headers
    post bookings_path, params: { booked_date: avail.date.to_s, start_time: "09:00", first_name: "Test", email: "test@example.com", phone_number: "5551234567" }, headers: @headers.merge("Referer" => "https://www.example.com/book/#{avail.date}")

    assert_response :redirect
    event = Visit.last.events.bookings.last
    assert_equal "booked a call", event.label
    assert_equal "/book/#{avail.date}", event.path
  end
end
