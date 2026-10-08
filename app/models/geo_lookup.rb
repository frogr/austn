# Country, region, city and network owner for an IP, from ipwho.is (free,
# no key, 10k lookups a month). Results are cached for a month so a
# returning visitor costs one lookup. Private and local addresses, and any
# failure, give an empty answer; the visit then just shows no place.
module GeoLookup
  URL = "https://ipwho.is/%s"
  FIELDS = %w[country region city org].freeze

  def self.call(ip)
    return {} if ip.blank? || private?(ip)

    Rails.cache.fetch("geo:#{ip}", expires_in: 30.days) { fetch(ip) }
  end

  def self.private?(ip)
    address = IPAddr.new(ip)
    address.private? || address.loopback? || address.link_local?
  rescue IPAddr::Error
    true
  end

  def self.fetch(ip)
    response = HTTParty.get(format(URL, ip), query: { fields: "success,country,region,city,connection" }, timeout: 5, headers: { "User-Agent" => "austn.net analytics" })
    data = response.parsed_response
    return {} unless response.success? && data.is_a?(Hash) && data["success"]

    { "country" => data["country"], "region" => data["region"], "city" => data["city"], "org" => data.dig("connection", "org") }.compact_blank
  rescue StandardError => e
    Rails.logger.warn("GeoLookup failed: #{e.class}: #{e.message}")
    {}
  end
  private_class_method :fetch
end
