module MoneyFormattable
  extend ActiveSupport::Concern

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
end
