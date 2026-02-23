class Invoice < ApplicationRecord
  belongs_to :client
  has_many :line_items, class_name: "InvoiceLineItem", dependent: :destroy

  accepts_nested_attributes_for :line_items, allow_destroy: true, reject_if: :all_blank

  validates :invoice_number, presence: true, uniqueness: true
  validates :issue_date, presence: true
  validates :due_date, presence: true
  validates :status, presence: true, inclusion: { in: %w[draft sent viewed paid overdue] }

  before_validation :set_invoice_number, on: :create
  before_save :calculate_totals

  scope :draft, -> { where(status: "draft") }
  scope :sent, -> { where(status: "sent") }
  scope :paid, -> { where(status: "paid") }
  scope :overdue, -> { where(status: "overdue") }
  scope :outstanding, -> { where(status: %w[sent viewed overdue]) }

  def mark_as_paid!
    update!(status: "paid", paid_at: Time.current)
  end

  def mark_as_sent!
    update!(status: "sent", sent_at: Time.current)
  end

  def formatted_total
    format_money(total_cents)
  end

  def formatted_subtotal
    format_money(subtotal_cents)
  end

  def formatted_tax
    format_money(tax_cents)
  end

  private

  def set_invoice_number
    return if invoice_number.present?

    year = (issue_date || Date.current).year
    last_invoice = Invoice.where("invoice_number LIKE ?", "INV-#{year}-%").order(:invoice_number).last
    next_num = if last_invoice
      last_invoice.invoice_number.split("-").last.to_i + 1
    else
      1
    end
    self.invoice_number = "INV-#{year}-#{next_num.to_s.rjust(4, '0')}"
  end

  def calculate_totals
    self.subtotal_cents = line_items.reject(&:marked_for_destruction?).sum { |li| li.quantity * li.unit_price_cents }
    self.tax_cents = (subtotal_cents * (tax_rate || 0) / 100).round
    self.total_cents = subtotal_cents + tax_cents
  end

  def format_money(cents)
    dollars = cents.to_f / 100
    "$#{number_with_delimiter(format('%.2f', dollars))}"
  end

  def number_with_delimiter(number)
    parts = number.to_s.split(".")
    parts[0] = parts[0].gsub(/(\d)(?=(\d{3})+(?!\d))/, '\\1,')
    parts.join(".")
  end
end
