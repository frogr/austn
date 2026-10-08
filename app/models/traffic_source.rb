# Where a visit came from, read from the first request: the utm_* params
# when a link carries them, otherwise the referrer, otherwise "direct".
#
# A ?ref= param is the short form for links Austin hands out himself, like
# the one in his resume PDF (austn.net/hire?ref=resume). It sets the source
# and is kept on its own too, so the report can list it by name.
class TrafficSource
  KNOWN = {
    "google" => [ "search", /(^|\.)google\./ ],
    "bing" => [ "search", /(^|\.)bing\.com$/ ],
    "duckduckgo" => [ "search", /duckduckgo\.com$/ ],
    "linkedin" => [ "social", /linkedin\.com$|^lnkd\.in$/ ],
    "x" => [ "social", /(^|\.)(x|twitter)\.com$|^t\.co$/ ],
    "hacker news" => [ "social", /news\.ycombinator\.com$/ ],
    "reddit" => [ "social", /reddit\.com$/ ],
    "bluesky" => [ "social", /bsky\.app$/ ],
    "github" => [ "referral", /github\.com$/ ],
    "chatgpt" => [ "ai", /chatgpt\.com$|openai\.com$/ ],
    "claude" => [ "ai", /claude\.ai$|anthropic\.com$/ ],
    "perplexity" => [ "ai", /perplexity\.ai$/ ]
  }.freeze

  attr_reader :referrer_host, :campaign, :content, :term, :ref

  def initialize(referrer, params, host:)
    @referrer_host = host_of(referrer, own: host)
    @utm_source = clean(params["utm_source"])
    @utm_medium = clean(params["utm_medium"])
    @campaign = clean(params["utm_campaign"])
    @content = clean(params["utm_content"])
    @term = clean(params["utm_term"])
    @ref = clean(params["ref"])
  end

  def source
    @utm_source || @ref || known&.first || referrer_host || "direct"
  end

  def medium
    return @utm_medium if @utm_medium
    return "link" if @ref
    return known[1][0] if known
    referrer_host ? "referral" : "direct"
  end

  private

  def known
    return nil unless referrer_host
    @known ||= KNOWN.find { |_name, (_medium, pattern)| referrer_host.match?(pattern) }
  end

  # The referrer's host, minus www, or nil when it's this site or unreadable.
  def host_of(referrer, own:)
    return nil if referrer.blank?
    host = URI.parse(referrer).host&.downcase&.delete_prefix("www.")
    host if host.present? && host != own.to_s.downcase.delete_prefix("www.")
  rescue URI::InvalidURIError
    nil
  end

  def clean(value)
    value.to_s.strip.downcase[0, 100].presence if value.is_a?(String)
  end
end
