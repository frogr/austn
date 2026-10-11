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

  test "a swarm of one-page direct hits on one page in one hour is flagged, readers in the same hour are not" do
    now = Time.current.beginning_of_hour + 10.minutes
    Visit::SWARM_SIZE.times { |i| visit(ip: "198.51.100.#{i}", started_at: now + i.seconds) }
    reader = visit(ip: "203.0.113.5", pages: 3, started_at: now)
    from_linkedin = visit(ip: "203.0.113.6", medium: "social", started_at: now)
    other_page = visit(ip: "203.0.113.7", path: "/hire", started_at: now)
    earlier = visit(ip: "203.0.113.8", started_at: now - 1.hour)

    assert_equal Visit::SWARM_SIZE, Visit.flag_swarms!(since: 3.hours.ago)
    assert_equal Visit::SWARM_SIZE, Visit.automated.count
    [ reader, from_linkedin, other_page, earlier ].each { |v| assert_not v.reload.bot?, "#{v.ip} should still count" }

    assert_equal 0, Visit.flag_swarms!(since: 3.hours.ago), "flagging again finds nothing new"
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
