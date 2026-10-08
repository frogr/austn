require "test_helper"

class VisitorAgentTest < ActiveSupport::TestCase
  IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  MAC_CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
  WINDOWS_EDGE = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0"
  ANDROID_TABLET = "Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

  test "reads the browser, system and device" do
    agent = VisitorAgent.new(IPHONE)
    assert_equal [ "Safari", "iOS", "phone" ], [ agent.browser, agent.os, agent.device ]

    agent = VisitorAgent.new(MAC_CHROME)
    assert_equal [ "Chrome", "macOS", "computer" ], [ agent.browser, agent.os, agent.device ]

    agent = VisitorAgent.new(WINDOWS_EDGE)
    assert_equal [ "Edge", "Windows", "computer" ], [ agent.browser, agent.os, agent.device ]

    assert_equal "tablet", VisitorAgent.new(ANDROID_TABLET).device
  end

  test "knows a crawler, a script and an empty agent when it sees one" do
    assert VisitorAgent.new("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)").bot?
    assert VisitorAgent.new("curl/8.4.0").bot?
    assert VisitorAgent.new("python-requests/2.31").bot?
    assert VisitorAgent.new("").bot?
    assert VisitorAgent.new(nil).bot?
    assert_not VisitorAgent.new(IPHONE).bot?
  end

  test "an unknown agent reads as other, not an error" do
    agent = VisitorAgent.new("SomethingNew/1.0")
    assert_equal [ "other", "other", "computer" ], [ agent.browser, agent.os, agent.device ]
  end
end
