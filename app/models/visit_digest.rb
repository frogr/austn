# The numbers for the digest email Austin gets twice a week: who came in the
# last few days, what they did, and where they stopped short of booking a
# call. The "signals" are plain rules, no model involved, and each one
# names the move in docs/conversion-playbook.md that answers it.
class VisitDigest
  PERIOD = 3.days
  READERS_SHOWN = 40
  LOOKAHEAD_DAYS = 14
  FEW_SLOTS = 5

  Signal = Struct.new(:key, :count, :what, :idea)

  # One line each; docs/conversion-playbook.md has the full move.
  IDEAS = {
    "hire-no-action" => "The offer isn't landing or the next step isn't obvious. Put the call button in the offer cards and shorten the pitch above them.",
    "book-no-booking" => "Check that the next two weeks have open slots at sensible hours, and that the form asks for nothing it doesn't need.",
    "resume-not-hire" => "The resume page should say, near the top, that there is a hire page and what it offers.",
    "work-not-hire" => "Case studies without a hire note at the end should get one, like the proof pages have.",
    "referred-bounce" => "The home page isn't moving tagged or referred visitors on. Check what the link promised against what the first screen says.",
    "phone-bounce" => "Load the landing pages on a phone and check the first screen and the button sizes.",
    "few-slots" => "Open more weekly hours or one-off times; nobody books a calendar with nothing on it."
  }.freeze

  attr_reader :since, :until_time

  def initialize(until_time: Time.current, period: PERIOD)
    @until_time = until_time
    @since = until_time - period
    @period = period
  end

  def visits = Visit.people.where(started_at: since...until_time)
  def previous_visits = Visit.people.where(started_at: (since - @period)...since)
  def events = VisitEvent.where(visit_id: visits.select(:id))

  def visitors = visits.distinct.count(:visitor_id)
  def previous_visitors = previous_visits.distinct.count(:visitor_id)
  def readers = visits.where("page_views_count > 1").count
  def previous_readers = previous_visits.where("page_views_count > 1").count
  def hire_visitors = visits.where(id: touching("/hire")).count
  def resume_visitors = visits.where(id: touching("/resume")).count
  def demo_clicks = events.clicks.where("label LIKE 'demo/%'").count
  def bookings = events.bookings.count
  def automated = Visit.automated.where(started_at: since...until_time).count

  # Visits worth reading one by one: more than one page, or the pages that
  # matter, or a booking. Newest first.
  def reader_visits
    interesting = visits.where("page_views_count > 1")
      .or(visits.where(id: touching("/hire")))
      .or(visits.where(id: touching("/resume")))
      .or(visits.where(id: touching("/book%")))
      .or(visits.where(id: events.bookings.select(:visit_id)))
    interesting.recent_first.limit(READERS_SHOWN).includes(:events)
  end

  # [name, count] for the ?ref= and utm_campaign links that brought people.
  def tagged_links
    refs = visits.where.not(ref: nil).group(:ref).count
    campaigns = visits.where.not(campaign: nil).group(:campaign).count
    refs.merge(campaigns) { |_key, a, b| a + b }.sort_by { |_key, count| -count }
  end

  def sources
    visits.group(:source, :medium).count.sort_by { |_key, count| -count }.first(8).map { |(source, medium), count| [ medium == "direct" ? "direct" : "#{source} / #{medium}", count ] }
  end

  # Where people stopped. Each signal is only listed when it fired.
  def signals
    found = []
    found << signal("hire-no-action", hire_no_action, "saw the hire page and left without opening a demo, a case study or the booking page")
    found << signal("book-no-booking", book_no_booking, "opened the booking page and did not book")
    found << signal("resume-not-hire", resume_not_hire, "read the resume but never saw the hire page")
    found << signal("work-not-hire", work_not_hire, "read a case study but never saw the hire page")
    found << signal("referred-bounce", referred_bounce, "arrived from a link or a tag and left after one page")
    found << phone_signal
    found << slots_signal
    found.compact
  end

  def hire_no_action = visits.where(id: touching("/hire")).where.not(id: events.actions.select(:visit_id)).where.not(id: touching("/book%")).count
  def book_no_booking = visits.where(id: touching("/book%")).where.not(id: events.bookings.select(:visit_id)).count
  def resume_not_hire = visits.where(id: touching("/resume")).where.not(id: touching("/hire")).count
  def work_not_hire = visits.where(id: touching("/work/%")).where.not(id: touching("/hire")).count
  def referred_bounce = visits.where.not(medium: "direct").or(visits.where.not(ref: nil)).where(page_views_count: 1).count

  def open_slots
    today = Date.current
    BookingSchedule.new.open_slots(today..(today + LOOKAHEAD_DAYS - 1)).size
  end

  private

  def touching(pattern)
    VisitEvent.page_views.where(visit_id: visits.select(:id)).where("path LIKE ?", pattern).select(:visit_id)
  end

  def signal(key, count, what)
    Signal.new(key, count, what, IDEAS.fetch(key)) if count.positive?
  end

  # Phones leaving after one page much more often than computers.
  def phone_signal
    phones = visits.where(device: "phone")
    computers = visits.where(device: "computer")
    return nil if phones.count < 10 || computers.count < 10

    phone_rate = phones.where(page_views_count: 1).count.fdiv(phones.count)
    computer_rate = computers.where(page_views_count: 1).count.fdiv(computers.count)
    return nil unless phone_rate > computer_rate + 0.2

    Signal.new("phone-bounce", phones.where(page_views_count: 1).count, "phone visitors left after one page (#{(phone_rate * 100).round}% of phones against #{(computer_rate * 100).round}% of computers)", IDEAS.fetch("phone-bounce"))
  end

  def slots_signal
    slots = open_slots
    return nil if slots >= FEW_SLOTS

    Signal.new("few-slots", slots, "open booking #{'slot'.pluralize(slots)} in the next #{LOOKAHEAD_DAYS} days", IDEAS.fetch("few-slots"))
  end
end
