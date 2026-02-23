class Client < ApplicationRecord
  has_many :invoices, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true
  validates :address_line1, presence: true
  validates :city, presence: true
  validates :state, presence: true
  validates :zip, presence: true

  def full_address
    parts = [address_line1]
    parts << address_line2 if address_line2.present?
    parts << "#{city}, #{state} #{zip}"
    parts.join("\n")
  end

  def total_invoiced_cents
    invoices.sum(:total_cents)
  end

  def total_paid_cents
    invoices.where(status: "paid").sum(:total_cents)
  end

  def outstanding_cents
    invoices.where(status: %w[sent viewed overdue]).sum(:total_cents)
  end
end
