require "test_helper"

class TrafficSourceTest < ActiveSupport::TestCase
  def source_for(referrer, params = {})
    TrafficSource.new(referrer, params, host: "austn.net")
  end

  test "no referrer and no params is direct" do
    source = source_for(nil)
    assert_equal [ "direct", "direct", nil ], [ source.source, source.medium, source.referrer_host ]
  end

  test "a known referrer gets its name and medium" do
    source = source_for("https://www.linkedin.com/feed/")
    assert_equal [ "linkedin", "social", "linkedin.com" ], [ source.source, source.medium, source.referrer_host ]

    assert_equal [ "google", "search" ], source_for("https://www.google.com/").then { |s| [ s.source, s.medium ] }
    assert_equal [ "hacker news", "social" ], source_for("https://news.ycombinator.com/item?id=1").then { |s| [ s.source, s.medium ] }
    assert_equal [ "chatgpt", "ai" ], source_for("https://chatgpt.com/").then { |s| [ s.source, s.medium ] }
  end

  test "an unknown referrer is a referral from its host" do
    source = source_for("https://blog.example.org/post")
    assert_equal [ "blog.example.org", "referral" ], [ source.source, source.medium ]
  end

  test "a referrer from this site is not a referrer" do
    source = source_for("https://austn.net/work")
    assert_equal [ "direct", "direct", nil ], [ source.source, source.medium, source.referrer_host ]
  end

  test "utm params win over the referrer" do
    source = source_for("https://www.google.com/", "utm_source" => "Newsletter", "utm_medium" => "email", "utm_campaign" => "Oct", "utm_content" => "top", "utm_term" => "mcp")
    assert_equal "newsletter", source.source
    assert_equal "email", source.medium
    assert_equal [ "oct", "top", "mcp" ], [ source.campaign, source.content, source.term ]
    assert_equal "google.com", source.referrer_host
  end

  test "ref= is the short form for links Austin hands out" do
    source = source_for(nil, "ref" => "resume")
    assert_equal [ "resume", "link", "resume" ], [ source.source, source.medium, source.ref ]
  end

  test "bad input is ignored" do
    source = source_for("not a url", "utm_source" => [ "array" ], "ref" => " " * 5)
    assert_equal [ "direct", "direct", nil, nil ], [ source.source, source.medium, source.referrer_host, source.ref ]
    assert_equal 100, source_for(nil, "utm_source" => "x" * 500).source.length
  end
end
