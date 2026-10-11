# One person's time on the site: the pages they saw and the links they
# followed out, with where they came from. Recorded server-side, so the
# public pages still ship no JavaScript and set no tracking cookie.
#
# A visitor is a hash of their IP and browser. A visit ends after thirty
# quiet minutes; the next request starts a new one. Attribution (source,
# medium, campaign, ref) is read once, from the first request of the visit.
#
# Crawlers that say so are never recorded. Two other kinds are recorded but
# flagged `bot` and left out of the report: visits from hosting networks
# (OVH, DigitalOcean, AWS and the like, found by the place lookup),
# and swarms: an hour in which dozens of different addresses each arrive
# direct and leave within a page or three. That is what a scanner behind
# residential proxies looks like. Readers come a few an hour, and the ones
# that arrive in a rush come from somewhere with a referrer.
class Visit < ApplicationRecord
  has_many :events, class_name: "VisitEvent", dependent: :delete_all

  IDLE_AFTER = 30.minutes
  KEEP_FOR = 1.year
  UTM_KEYS = %w[utm_source utm_medium utm_campaign utm_content utm_term ref].freeze
  # Networks nobody browses from. Google, Microsoft and Amazon are not here
  # on purpose: their office networks carry the same names as their crawlers,
  # and a recruiter at one of them is exactly who the report is for.
  HOSTING = /ovh|digitalocean|hetzner|linode|contabo|leaseweb|vultr|choopa|m247|scaleway|datacamp|data ?services|\bcloud\b|hosting|data ?cent|servers?\b|censys|shodan|stretchoid|onyphe|binaryedge|internet.measurement|collyer quay|omegatech|1337 services|inap-|rmp protection|cia triad|buyvm|hostslick|frantech|internetbolaget/i
  # Their crawlers and their offices share these names. A visit from one
  # counts only when it reads enough pages to be a person (see flag_crawlers!).
  BIG_TECH = /google llc|microsoft|amazon technologies|amazon data services|amazon\.com/i
  CRAWLER_PAGES = 2
  SWARM_WINDOW = 1.hour
  SWARM_SIZE = 25
  SWARM_PAGES = 3

  scope :since, ->(time) { where(started_at: time..) }
  scope :people, -> { where(bot: false) }
  scope :automated, -> { where(bot: true) }
  scope :recent_first, -> { order(last_seen_at: :desc) }
  # Visits that touched a page. The hire page is the one Austin asks about.
  scope :touching, ->(path) { where(id: VisitEvent.page_views.where(path: path).select(:visit_id)) }

  # Finds the visit this request continues, or starts one. Returns nil for
  # requests that should not count: crawlers, and Austin while signed in.
  def self.for_request(request, admin: false)
    return nil if admin
    agent = VisitorAgent.new(request.user_agent)
    return nil if agent.bot?

    visitor_id = visitor_id_for(request.remote_ip, request.user_agent)
    current = where(visitor_id: visitor_id).where(last_seen_at: IDLE_AFTER.ago..).recent_first.first
    current || start(request, visitor_id, agent)
  end

  # Stable for one person on one device, without a cookie. The secret keeps
  # the hash from being reversed into an IP by anyone who reads the table.
  def self.visitor_id_for(ip, user_agent)
    Digest::SHA256.hexdigest([ Rails.application.secret_key_base, ip, user_agent ].join("|"))[0, 24]
  end

  def self.start(request, visitor_id, agent)
    source = TrafficSource.new(request.referer, request.params, host: request.host)
    visit = create!(
      visitor_id: visitor_id,
      ip: request.remote_ip,
      user_agent: request.user_agent.to_s[0, 500],
      browser: agent.browser,
      os: agent.os,
      device: agent.device,
      landing_path: request.path[0, 500],
      referrer: request.referer.to_s[0, 500].presence,
      referrer_host: source.referrer_host,
      source: source.source,
      medium: source.medium,
      campaign: source.campaign,
      content: source.content,
      term: source.term,
      ref: source.ref,
      started_at: Time.current,
      last_seen_at: Time.current
    )
    # A little later, so a visit flagged as a swarm by then is not looked up.
    GeoLookupJob.set(wait: 15.minutes).perform_later(visit.id)
    visit
  end
  private_class_method :start

  # Flags the swarms that started since the given time: an hour with enough
  # short direct visits is a swarm, and every direct visit that started in
  # it is flagged, however many times it reloaded a page. Returns how many
  # visits were newly flagged.
  def self.flag_swarms!(since: 2.hours.ago)
    direct = people.where(medium: "direct")
    hours = direct.since(since).where(page_views_count: ..SWARM_PAGES).group(Arel.sql("date_trunc('hour', started_at)")).having("count(*) >= ?", SWARM_SIZE).pluck(Arel.sql("date_trunc('hour', started_at)"))
    hours.sum { |hour| direct.where(started_at: hour...(hour + SWARM_WINDOW)).update_all(bot: true) }
  end

  # Flags finished direct visits from Google, Microsoft and Amazon addresses
  # that read two pages or fewer. Their crawlers fetch the home page and one
  # post; a person from one of their offices reads more. Returns the count.
  def self.flag_crawlers!(since: 2.hours.ago)
    people.since(since).where(medium: "direct", page_views_count: ..CRAWLER_PAGES)
      .where(last_seen_at: ...IDLE_AFTER.ago).where("org ~* ?", BIG_TECH.source).update_all(bot: true)
  end

  def self.hosting?(org)
    org.present? && org.match?(HOSTING)
  end

  def self.purge_old!
    where(started_at: ...KEEP_FOR.ago).find_each(&:destroy)
  end

  def record(name, path:, referrer_path: nil, label: nil, href: nil)
    events.create!(name: name, path: path&.slice(0, 500), referrer_path: referrer_path&.slice(0, 500), label: label&.slice(0, 200), href: href&.slice(0, 500), created_at: Time.current)
    changes = { last_seen_at: Time.current }
    changes[:page_views_count] = page_views_count + 1 if name == "page_view"
    update_columns(changes)
  end

  # "Brooklyn, United States", or whatever parts the lookup found.
  def place
    [ city, country ].compact_blank.join(", ").presence
  end

  # "linkedin / social" or "direct" for the lists.
  def source_label
    medium == "direct" ? "direct" : "#{source} / #{medium}"
  end

  def duration
    last_seen_at - started_at
  end

  # The pages seen, in order. Works on preloaded events, so lists don't query per row.
  def paths
    events.select(&:page_view?).sort_by(&:created_at).map(&:path)
  end
end
