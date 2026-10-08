require "test_helper"

class GeoLookupTest < ActiveSupport::TestCase
  FakeResponse = Struct.new(:success?, :parsed_response)

  test "private and local addresses are never looked up" do
    HTTParty.stub(:get, ->(*) { raise "should not be called" }) do
      assert_equal({}, GeoLookup.call("127.0.0.1"))
      assert_equal({}, GeoLookup.call("10.1.2.3"))
      assert_equal({}, GeoLookup.call("not an ip"))
      assert_equal({}, GeoLookup.call(nil))
    end
  end

  test "a good answer gives the place and the network, cached for next time" do
    body = { "success" => true, "country" => "United States", "region" => "New York", "city" => "Brooklyn", "connection" => { "org" => "Verizon" } }
    calls = 0
    HTTParty.stub(:get, ->(*) { calls += 1; FakeResponse.new(true, body) }) do
      expected = { "country" => "United States", "region" => "New York", "city" => "Brooklyn", "org" => "Verizon" }
      assert_equal expected, GeoLookup.call("203.0.113.9")
      assert_equal expected, GeoLookup.call("203.0.113.9")
    end
    assert_equal 1, calls
  end

  test "a failed lookup is an empty answer, not an error" do
    HTTParty.stub(:get, ->(*) { FakeResponse.new(true, { "success" => false, "message" => "reserved range" }) }) do
      assert_equal({}, GeoLookup.call("203.0.113.9"))
    end
    HTTParty.stub(:get, ->(*) { raise Net::OpenTimeout }) do
      assert_equal({}, GeoLookup.call("203.0.113.10"))
    end
  end

  test "the job fills in the visit" do
    visit = Visit.create!(visitor_id: "abc", ip: "203.0.113.9", landing_path: "/", source: "direct", medium: "direct", started_at: Time.current, last_seen_at: Time.current)
    GeoLookup.stub(:call, { "country" => "Canada", "city" => "Toronto", "org" => "Rogers" }) do
      GeoLookupJob.perform_now(visit.id)
    end
    assert_equal [ "Canada", "Toronto", "Rogers" ], visit.reload.values_at(:country, :city, :org)
  end
end
