# Small formatters for the admin analytics pages.
module AnalyticsHelper
  # "3m 20s", "45s" or "0s" for a visit's length.
  def short_duration(seconds)
    seconds = seconds.to_i
    return "#{seconds}s" if seconds < 60

    "#{seconds / 60}m #{seconds % 60}s"
  end

  # Width of a bar as a share of the biggest value, never below a sliver.
  def bar_width(value, max)
    return "0%" if max.to_i.zero?

    "#{[ (value.to_f / max * 100).round, 2 ].max}%"
  end

  # A ranked list as bars: [[label, count], ...].
  def ranked_list(rows, title:, empty: "Nothing yet")
    render "admin/analytics/ranked", rows: rows, title: title, empty: empty
  end

  # A visit's page views as "/hire → /work/gutenberg-mcp → /book".
  def visit_trail(visit)
    visit.paths.join(" → ")
  end
end
