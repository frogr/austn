require "test_helper"

# Visits that are not people: hosting networks and swarms.
class VisitBotsTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

  def visit(ip:, path: "/book", pages: 1, medium: "direct", started_at: Time.current)
    Visit.create!(visitor_id: Digest::SHA256.hexdigest(ip)[0, 24], ip: ip, user_agent: CHROME, landing_path: path, source: medium, medium: medium, page_views_count: pages, started_at: started_at, last_seen_at: started_at)
  end

  test "hosting networks are crawlers, big companies' offices are not" do
    assert Visit.hosting?("OVH SAS")
    assert Visit.hosting?("DigitalOcean, LLC")
    assert Visit.hosting?("Amazon Data Services Northern Virginia")
    assert Visit.hosting?("Tencent cloud computing")
    assert Visit.hosting?("Censys, Inc.")
    assert Visit.hosting?("16 COLLYER QUAY")
    assert_not Visit.hosting?("Google LLC")
    assert_not Visit.hosting?("Microsoft Corporation")
    assert_not Visit.hosting?("Amazon.com, Inc.")
    assert_not Visit.hosting?("Verizon Business")
    assert_not Visit.hosting?(nil)
  end

  test "the place lookup flags a visit from a hosting network and skips flagged ones" do
    hosted = visit(ip: "203.0.113.1")
    GeoLookup.stub(:call, { "country" => "France", "org" => "OVH SAS" }) { GeoLookupJob.perform_now(hosted.id) }
    assert hosted.reload.bot?
    assert_equal "France", hosted.country

    flagged = visit(ip: "203.0.113.2")
    flagged.update_columns(bot: true)
    GeoLookup.stub(:call, ->(*) { raise "should not look up a flagged visit" }) { GeoLookupJob.perform_now(flagged.id) }
  end

  test "a new visit waits before its place is looked up" do
    env = Rack::MockRequest.env_for("https://austn.net/hire", "REMOTE_ADDR" => "203.0.113.9", "HTTP_USER_AGENT" => CHROME, "HTTP_HOST" => "austn.net")
    freeze_time do
      Visit.for_request(ActionDispatch::Request.new(env))
      assert_enqueued_with(job: GeoLookupJob, at: 15.minutes.from_now)
    end
  end

  test "an hour of short direct visits from many addresses is a swarm; referred visits in it and visits outside it are not" do
    now = Time.current.beginning_of_hour + 10.minutes
    Visit::SWARM_SIZE.times { |i| visit(ip: "198.51.100.#{i}", path: [ "/book", "/book/2026-11-0#{i % 9}", "/work/tenex", "/go/demo/marginalia" ][i % 4], pages: i % 4, started_at: now + i.seconds) }
    from_linkedin = visit(ip: "203.0.113.6", medium: "social", started_at: now)
    earlier = visit(ip: "203.0.113.8", started_at: now - 1.hour)

    assert_equal Visit::SWARM_SIZE, Visit.flag_swarms!(since: 3.hours.ago)
    assert_equal Visit::SWARM_SIZE, Visit.automated.count
    [ from_linkedin, earlier ].each { |v| assert_not v.reload.bot?, "#{v.ip} should still count" }

    assert_equal 0, Visit.flag_swarms!(since: 3.hours.ago), "flagging again finds nothing new"
  end

  test "every direct visit in a swarm hour is flagged, even one that reloaded a page five times" do
    now = Time.current.beginning_of_hour + 10.minutes
    Visit::SWARM_SIZE.times { |i| visit(ip: "198.51.100.#{i}", started_at: now + i.seconds) }
    reloader = visit(ip: "203.0.113.5", pages: 5, started_at: now + 20.minutes)
    referred = visit(ip: "203.0.113.6", medium: "social", pages: 5, started_at: now + 20.minutes)

    Visit.flag_swarms!(since: 3.hours.ago)
    assert reloader.reload.bot?
    assert_not referred.reload.bot?
  end

  test "a short direct visit from a big crawler's network is a crawler once it is over; a longer one is a person" do
    short = visit(ip: "203.0.113.1", pages: 2, started_at: 2.hours.ago)
    long = visit(ip: "203.0.113.2", pages: 3, started_at: 2.hours.ago)
    fresh = visit(ip: "203.0.113.3", pages: 1, started_at: 5.minutes.ago)
    short.update_columns(org: "Microsoft Corporation")
    long.update_columns(org: "Microsoft Corporation")
    fresh.update_columns(org: "Google LLC")
    home_isp = visit(ip: "203.0.113.4", pages: 1, started_at: 2.hours.ago)
    home_isp.update_columns(org: "Comcast Cable Communications, LLC")

    assert_equal 1, Visit.flag_crawlers!(since: 3.hours.ago)
    assert short.reload.bot?
    assert_not long.reload.bot?
    assert_not fresh.reload.bot?, "still going, judged later"
    assert_not home_isp.reload.bot?
  end

  test "a few one-page direct visits are not a swarm" do
    5.times { |i| visit(ip: "198.51.100.#{i}") }
    assert_equal 0, Visit.flag_swarms!
    assert_equal 0, Visit.automated.count
  end

  test "the report leaves flagged visits out and says how many" do
    visit(ip: "203.0.113.5", pages: 2)
    3.times { |i| visit(ip: "198.51.100.#{i}").update_columns(bot: true) }
    report = VisitReport.new(days: 7)
    assert_equal 1, report.visitors
    assert_equal 3, report.automated
  end
end
