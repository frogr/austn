# One person's time on the site: the pages they saw and the links they
# followed out, with where they came from. Recorded server-side, so the
# public pages still ship no JavaScript and set no tracking cookie.
#
# A visitor is a hash of their IP and browser. A visit ends after thirty
# quiet minutes; the next request starts a new one. Attribution (source,
# medium, campaign, ref) is read once, from the first request of the visit.
class Visit < ApplicationRecord
  has_many :events, class_name: "VisitEvent", dependent: :delete_all

  IDLE_AFTER = 30.minutes
  KEEP_FOR = 1.year
  UTM_KEYS = %w[utm_source utm_medium utm_campaign utm_content utm_term ref].freeze

  scope :since, ->(time) { where(started_at: time..) }
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
    GeoLookupJob.perform_later(visit.id)
    visit
  end
  private_class_method :start

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
