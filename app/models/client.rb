class Client < ApplicationRecord
  has_many :invoices, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true
  validates :address_line1, presence: true
  validates :city, presence: true
  validates :state, presence: true
  validates :zip, presence: true

  def full_address
    parts = [ address_line1 ]
    parts << address_line2 if address_line2.present?
    parts << "#{city}, #{state} #{zip}"
    parts.join("\n")
  end

  # NOTE: These instance methods trigger individual queries per client.
  # Do NOT call them in list views — use Client.with_invoice_totals instead.
  def total_invoiced_cents
    invoices.sum(:total_cents)
  end

  def total_paid_cents
    invoices.where(status: "paid").sum(:total_cents)
  end

  def outstanding_cents
    invoices.where(status: %w[sent viewed overdue]).sum(:total_cents)
  end

  # Efficient scope for list views — calculates all totals in a single query
  def self.with_invoice_totals
    select(
      "clients.*",
      "COALESCE(SUM(invoices.total_cents), 0) AS computed_total_invoiced_cents",
      "COALESCE(SUM(CASE WHEN invoices.status = 'paid' THEN invoices.total_cents ELSE 0 END), 0) AS computed_total_paid_cents",
      "COALESCE(SUM(CASE WHEN invoices.status IN ('sent', 'viewed', 'overdue') THEN invoices.total_cents ELSE 0 END), 0) AS computed_outstanding_cents"
    ).left_joins(:invoices).group("clients.id")
  end
end
