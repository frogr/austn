require "test_helper"

# Links that leave the site go through /go so the click is counted.
class GoControllerTest < ActionDispatch::IntegrationTest
  CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

  setup { @headers = { "User-Agent" => CHROME, "REMOTE_ADDR" => "203.0.113.9" } }

  test "a demo link sends the visitor on and records the click on the page they left" do
    item = WorkItem.find("gutenberg-mcp")
    get hire_path, headers: @headers
    get go_path("demo", item.slug), headers: @headers.merge("Referer" => "https://www.example.com/hire")

    assert_redirected_to item.demo_url
    assert_equal "noindex", response.headers["X-Robots-Tag"]
    click = Visit.last.events.clicks.last
    assert_equal [ "demo/gutenberg-mcp", item.demo_url, "/hire" ], [ click.label, click.href, click.path ]
  end

  test "every kind of named link resolves to a URL already in the content" do
    item = WorkItem.all.find { |work| work.links.any? }
    link = item.links.first
    course = Course.find("evals-in-production")

    assert_equal item.links.first["url"], Outbound.url_for("link", "#{item.slug}/#{link["label"].parameterize}")
    assert_equal Profile.links["github"], Outbound.url_for("profile", "github")
    assert_equal Resume.current.links.find { |l| l["label"] == "GitHub" }["url"], Outbound.url_for("resume", "github")
    assert_equal course.starter_url, Outbound.url_for("course", "#{course.slug}/starter")
    assert_nil Outbound.url_for("course", "#{course.slug}/buy"), "buy_url is set; update this test"
  end

  test "an unknown link is a 404, so this is not an open redirect" do
    get go_path("demo", "no-such-project"), headers: @headers
    assert_response :not_found

    get go_path("profile", "https://evil.example"), headers: @headers
    assert_response :not_found

    get go_path("link", "gutenberg-mcp/nope"), headers: @headers
    assert_response :not_found

    assert_nil Outbound.url_for("anything", "else")
    assert_equal 0, VisitEvent.count
  end

  test "the public pages link out through /go" do
    get hire_path
    assert_select "a.button[href=?]", go_path("demo", "gutenberg-mcp"), text: "Try it live"
    assert_select ".site-footer a[href=?]", go_path("profile", "github"), text: "GitHub"

    get work_item_path("gutenberg-mcp")
    assert_select ".rail a.button[href=?]", go_path("demo", "gutenberg-mcp")

    get resume_path
    assert_select ".rail a[href=?]", go_path("resume", "linkedin"), text: "LinkedIn"
  end

  test "the resume PDF links back to the site with ref=resume" do
    pdf = ResumePdf.new(Resume.current)
    assert_equal "https://austn.net/?ref=resume", pdf.send(:tagged, "https://austn.net")
    assert_equal "https://austn.net/hire?x=1&ref=resume", pdf.send(:tagged, "https://austn.net/hire?x=1")
    assert_equal "https://github.com/frogr", pdf.send(:tagged, "https://github.com/frogr")
  end
end
