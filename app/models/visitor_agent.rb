# The few things worth knowing from a User-Agent string: is it a crawler,
# and roughly which browser, system and kind of device. A handful of
# patterns covers nearly everyone; the rest read as "other".
class VisitorAgent
  BOT = /bot|crawl|spider|slurp|fetch|scan|monitor|preview|headless|lighthouse|curl|wget|python|java\/|go-http|okhttp|httpclient|facebookexternalhit|embedly|quora link|pingdom|uptime|validator/i

  BROWSERS = [
    [ "Edge", /Edg(e|iOS|A)?\// ],
    [ "Opera", /OPR\/|Opera/ ],
    [ "Samsung Internet", /SamsungBrowser/ ],
    [ "Chrome", /Chrome\/|CriOS\// ],
    [ "Firefox", /Firefox\/|FxiOS\// ],
    [ "Safari", /Safari\// ]
  ].freeze

  SYSTEMS = [
    [ "iOS", /iPhone|iPad|iPod/ ],
    [ "Android", /Android/ ],
    [ "Windows", /Windows/ ],
    [ "macOS", /Macintosh|Mac OS X/ ],
    [ "ChromeOS", /CrOS/ ],
    [ "Linux", /Linux|X11/ ]
  ].freeze

  attr_reader :string

  def initialize(string)
    @string = string.to_s
  end

  def bot?
    string.blank? || string.match?(BOT)
  end

  def browser
    BROWSERS.find { |_name, pattern| string.match?(pattern) }&.first || "other"
  end

  def os
    SYSTEMS.find { |_name, pattern| string.match?(pattern) }&.first || "other"
  end

  # phone, tablet or computer.
  def device
    return "tablet" if string.match?(/iPad|Tablet|(Android(?!.*Mobile))/)
    return "phone" if string.match?(/Mobi|iPhone|iPod|Android/)
    "computer"
  end
end
