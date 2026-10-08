# The numbers behind the admin analytics page, for the last 7, 30 or 90
# days: who came, from where, what they looked at and where they went next.
# Every method is one grouped query; nothing is cached, the tables are small.
class VisitReport
  RANGES = [ 7, 30, 90 ].freeze
  HIRE_FUNNEL = [
    [ "Saw the hire page", ->(visits) { visits.touching("/hire") } ],
    [ "Opened a case study", ->(visits) { visits.where(id: VisitEvent.page_views.where("path LIKE '/work/%'").select(:visit_id)) } ],
    [ "Tried a demo", ->(visits) { visits.where(id: VisitEvent.clicks.where("label LIKE 'demo/%'").select(:visit_id)) } ],
    [ "Opened the booking page", ->(visits) { visits.touching("/book") } ],
    [ "Booked a call", ->(visits) { visits.where(id: VisitEvent.bookings.select(:visit_id)) } ]
  ].freeze

  attr_reader :days, :since

  def initialize(days: 30)
    @days = RANGES.include?(days.to_i) ? days.to_i : 30
    @since = (@days - 1).days.ago.beginning_of_day
  end

  def visits = Visit.since(since)
  def events = VisitEvent.since(since)

  def visitors = visits.distinct.count(:visitor_id)
  def visit_count = visits.count
  def page_views = events.page_views.count
  def hire_visitors = visits.touching("/hire").distinct.count(:visitor_id)
  def demo_clicks = events.clicks.where("label LIKE 'demo/%'").count
  def bookings = events.bookings.count

  # One row per day in the range, oldest first: [date, visitors, page views].
  def by_day
    visitors = visits.group(local_day("started_at")).distinct.count(:visitor_id)
    views = events.page_views.group(local_day("created_at")).count
    (since.to_date..Date.current).map { |date| [ date, visitors.fetch(date, 0), views.fetch(date, 0) ] }
  end

  # [path, views, visits], most viewed first.
  def top_pages(limit: 15)
    views = events.page_views.group(:path).count
    visits_by_path = events.page_views.group(:path).distinct.count(:visit_id)
    views.sort_by { |_path, count| -count }.first(limit).map { |path, count| [ path, count, visits_by_path[path] ] }
  end

  def sources = ranked(visits.group(:source, :medium).count).map { |(source, medium), count| [ medium == "direct" ? "direct" : "#{source} / #{medium}", count ] }
  def referrers = ranked(visits.where.not(referrer_host: nil).group(:referrer_host).count)
  def campaigns = ranked(visits.where.not(campaign: nil).group(:campaign).count)
  def refs = ranked(visits.where.not(ref: nil).group(:ref).count)
  def countries = ranked(visits.group(:country).count).map { |country, count| [ country || "unknown", count ] }
  def cities = ranked(visits.where.not(city: nil).group(:city, :country).count).map { |(city, country), count| [ "#{city}, #{country}", count ] }
  def orgs = ranked(visits.where.not(org: nil).group(:org).count)
  def devices = ranked(visits.group(:device).count)
  def browsers = ranked(visits.group(:browser).count)
  def systems = ranked(visits.group(:os).count)
  def clicks = ranked(events.clicks.group(:label).count)
  def landing_pages = ranked(visits.group(:landing_path).count)

  # Visitors in the range who reached each step. The steps are not strictly
  # in order: someone who booked without opening a case study still counts
  # at the end. It is a picture of the hire page's reach, not a strict path.
  def hire_funnel
    HIRE_FUNNEL.map { |label, step| [ label, step.call(visits).distinct.count(:visitor_id) ] }
  end

  # The latest visits, optionally only those that touched one page.
  def recent(touching: nil, limit: 50)
    scope = touching.present? ? visits.touching(touching) : visits
    scope.recent_first.limit(limit).includes(:events)
  end

  private

  # The calendar day of a UTC timestamp in the site's time zone (New York).
  def local_day(column)
    Arel.sql(ApplicationRecord.sanitize_sql_array([ "date(#{column} AT TIME ZONE 'UTC' AT TIME ZONE ?)", Time.zone.tzinfo.identifier ]))
  end

  def ranked(counts, limit: 12)
    counts.sort_by { |_key, count| -count }.first(limit)
  end
end
