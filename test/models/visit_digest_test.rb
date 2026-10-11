require "test_helper"

class VisitDigestTest < ActiveSupport::TestCase
  include ActionMailer::TestHelper

  CHROME = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

  # A visit with the given page views in order, plus optional clicks and a booking.
  def visit(paths, ip:, at: 1.day.ago, medium: "direct", ref: nil, device: "computer", clicks: [], booked: false)
    v = Visit.create!(visitor_id: Digest::SHA256.hexdigest(ip)[0, 24], ip: ip, user_agent: CHROME, landing_path: paths.first, source: ref || medium, medium: medium, ref: ref, device: device, browser: "Chrome", os: "macOS", city: "Boston", country: "United States", started_at: at, last_seen_at: at)
    paths.each_with_index { |path, i| v.events.create!(name: "page_view", path: path, created_at: at + i.minutes) }
    clicks.each { |label| v.events.create!(name: "click", path: paths.last, label: label, href: "https://example.com", created_at: at + 10.minutes) }
    v.events.create!(name: "booking", path: "/book/2026-10-20", label: "booked a call", created_at: at + 12.minutes) if booked
    v.update_columns(page_views_count: paths.size)
    v
  end

  def few_people
    visit([ "/", "/hire" ], ip: "203.0.113.1")                                   # hire, no action
    visit([ "/hire", "/work/gutenberg-mcp" ], ip: "203.0.113.2", clicks: [ "demo/gutenberg-mcp" ]) # hire, acted
    visit([ "/", "/resume" ], ip: "203.0.113.3", medium: "social")               # resume, never hire
    visit([ "/work/tenex" ], ip: "203.0.113.4")                                  # case study only
    visit([ "/" ], ip: "203.0.113.5", ref: "acme")                               # tagged, bounced
    visit([ "/hire", "/book", "/book/2026-10-20" ], ip: "203.0.113.6", booked: true)
    visit([ "/book" ], ip: "203.0.113.7")                                        # opened book, no booking
    visit([ "/" ], ip: "203.0.113.8", at: 5.days.ago)                            # previous period
    Visit.create!(visitor_id: "bot", ip: "198.51.100.1", user_agent: CHROME, landing_path: "/book", source: "direct", medium: "direct", started_at: 1.day.ago, last_seen_at: 1.day.ago, bot: true)
  end

  test "counts the period, the one before and what was left out" do
    few_people
    d = VisitDigest.new

    assert_equal 7, d.visitors
    assert_equal 1, d.previous_visitors
    assert_equal 4, d.readers
    assert_equal 3, d.hire_visitors
    assert_equal 1, d.resume_visitors
    assert_equal 1, d.demo_clicks
    assert_equal 1, d.bookings
    assert_equal 1, d.automated
    assert_equal [ [ "acme", 1 ] ], d.tagged_links
    assert_equal [ "direct", 5 ], d.sources.first
  end

  test "says where people stopped, with the move from the playbook" do
    few_people
    signals = VisitDigest.new.signals.index_by(&:key)

    assert_equal 1, signals["hire-no-action"].count
    assert_equal 1, signals["book-no-booking"].count
    assert_equal 1, signals["resume-not-hire"].count
    assert_equal 1, signals["work-not-hire"].count
    assert_equal 1, signals["referred-bounce"].count
    assert_nil signals["phone-bounce"], "too few phones to judge"
    signals.each_value { |s| assert_match(/\S/, s.idea) }
    playbook = File.read(Rails.root.join("docs/conversion-playbook.md"))
    VisitDigest::IDEAS.each_key { |key| assert_includes playbook, "### `#{key}`" }
  end

  test "a quiet period has no signals and no readers" do
    d = VisitDigest.new
    slots = d.open_slots
    assert_equal slots < VisitDigest::FEW_SLOTS ? 1 : 0, d.signals.size
    assert_empty d.reader_visits
    assert_equal 0, d.visitors
  end

  test "phones leaving far more often than computers is a signal" do
    12.times { |i| visit([ "/" ], ip: "203.0.113.#{i}", device: "phone") }
    12.times { |i| visit([ "/", "/work" ], ip: "198.51.100.#{i}") }
    signal = VisitDigest.new.signals.find { |s| s.key == "phone-bounce" }
    assert_equal 12, signal.count
    assert_match "100% of phones against 0% of computers", signal.what
  end

  test "the readers list has the people worth reading about, newest first" do
    few_people
    readers = VisitDigest.new.reader_visits.to_a
    assert_equal 5, readers.size
    assert_not_includes readers.map(&:landing_path), "/work/tenex"
    assert_includes readers.map(&:landing_path), "/book"
  end

  test "the email names the numbers, the signals and each reader with a link" do
    few_people
    email = AdminMailer.visit_digest(VisitDigest.new)

    assert_equal [ ENV.fetch("ADMIN_EMAIL", "austindanielfrench@gmail.com") ], email.to
    assert_match "7 visitors, 4 readers, 1 booking", email.subject
    text = email.text_part.body.to_s
    html = email.html_part.body.to_s
    assert_match "saw the hire page and left without opening", text
    assert_match "playbook: hire-no-action", text
    assert_match "acme: 1", text
    assert_match "/hire > /book > /book/2026-10-20 > BOOKED", text
    assert_match "/work/gutenberg-mcp > out via demo/gutenberg-mcp", text
    assert_match %r{/admin/analytics/visits/\d+}, text
    assert_match "booked", html
    assert_match "Full report", html
  end

  test "the job sends the digest" do
    assert_emails 1 do
      VisitDigestJob.perform_now
    end
  end
end
