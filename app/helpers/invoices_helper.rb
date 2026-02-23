module InvoicesHelper
  def format_money(cents)
    return "$0.00" if cents.nil? || cents == 0
    dollars = cents.to_f / 100
    negative = dollars < 0
    dollars = dollars.abs
    formatted = format("%.2f", dollars)
    parts = formatted.split(".")
    parts[0] = parts[0].gsub(/(\d)(?=(\d{3})+(?!\d))/, '\\1,')
    result = "$#{parts.join('.')}"
    negative ? "-#{result}" : result
  end

  def invoice_status_badge(status)
    colors = {
      "draft" => "bg-gray-700 text-gray-300 border-gray-600",
      "sent" => "bg-blue-900/50 text-blue-300 border-blue-700",
      "viewed" => "bg-yellow-900/50 text-yellow-300 border-yellow-700",
      "paid" => "bg-green-900/50 text-green-300 border-green-700",
      "overdue" => "bg-red-900/50 text-red-300 border-red-700"
    }
    css = colors[status] || colors["draft"]
    content_tag(:span, status.capitalize, class: "inline-block px-2 py-0.5 text-xs font-semibold rounded border #{css}")
  end
end
