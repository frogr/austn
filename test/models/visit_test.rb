require "test_helper"

class VisitTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

  def request_for(path = "/hire", ip: "203.0.113.9", agent: CHROME, referer: nil, params: {})
    env = Rack::MockRequest.env_for("https://austn.net#{path}", "REMOTE_ADDR" => ip, "HTTP_USER_AGENT" => agent, "HTTP_REFERER" => referer, "HTTP_HOST" => "austn.net", "QUERY_STRING" => params.to_query)
    ActionDispatch::Request.new(env)
  end

  test "a first request starts a visit with its attribution and asks for a place" do
    visit = nil
    assert_enqueued_with(job: GeoLookupJob) do
      visit = Visit.for_request(request_for("/hire", referer: "https://www.linkedin.com/", params: { ref: "resume" }))
    end

    assert visit.persisted?
    assert_equal "/hire", visit.landing_path
    assert_equal [ "resume", "link", "resume", "linkedin.com" ], [ visit.source, visit.medium, visit.ref, visit.referrer_host ]
    assert_equal [ "Chrome", "macOS", "computer" ], [ visit.browser, visit.os, visit.device ]
    assert_equal "203.0.113.9", visit.ip
    assert_equal 24, visit.visitor_id.length
    assert_nil visit.country
  end

  test "the same person within half an hour continues the visit, later starts another" do
    first = Visit.for_request(request_for("/"))
    assert_equal first, Visit.for_request(request_for("/work"))

    travel Visit::IDLE_AFTER + 1.minute do
      second = Visit.for_request(request_for("/work"))
      assert_not_equal first, second
      assert_equal first.visitor_id, second.visitor_id
      assert_equal "/work", second.landing_path
    end
  end

  test "a different device is a different visitor" do
    laptop = Visit.for_request(request_for("/"))
    phone = Visit.for_request(request_for("/", agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1"))
    assert_not_equal laptop.visitor_id, phone.visitor_id
  end

  test "crawlers and Austin while signed in are not visits" do
    assert_nil Visit.for_request(request_for("/", agent: "Googlebot/2.1"))
    assert_nil Visit.for_request(request_for("/"), admin: true)
    assert_equal 0, Visit.count
  end

  test "recording keeps the counts and the last time" do
    visit = Visit.for_request(request_for("/hire"))
    visit.record("page_view", path: "/hire")
    visit.record("page_view", path: "/work/gutenberg-mcp", referrer_path: "/hire")
    visit.record("click", path: "/work/gutenberg-mcp", label: "demo/gutenberg-mcp", href: "https://gutenberg-mcp.onrender.com")

    assert_equal 2, visit.reload.page_views_count
    assert_equal [ "/hire", "/work/gutenberg-mcp" ], visit.paths
    assert_equal 1, visit.events.actions.count
    assert_equal "/hire", visit.events.page_views.last.referrer_path
  end

  test "visits older than a year are purged with their events" do
    old = Visit.for_request(request_for("/"))
    old.record("page_view", path: "/")
    old.update_columns(started_at: 13.months.ago, last_seen_at: 13.months.ago)
    travel 1.hour do
      kept = Visit.for_request(request_for("/", ip: "203.0.113.10"))
      Visit.purge_old!
      assert_equal [ kept ], Visit.all.to_a
      assert_equal 0, VisitEvent.count
    end
  end

  test "an event has to be one of the known kinds" do
    visit = Visit.for_request(request_for("/"))
    assert_raises(ActiveRecord::RecordInvalid) { visit.record("scroll", path: "/") }
  end
end
