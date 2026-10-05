require "test_helper"

class InvoiceTest < ActiveSupport::TestCase
  setup do
    @client = clients(:acme)
  end

  test "numbers invoices per year, starting at 0001" do
    first = create_invoice(issue_date: Date.new(2026, 3, 1))
    second = create_invoice(issue_date: Date.new(2026, 7, 1))
    next_year = create_invoice(issue_date: Date.new(2027, 1, 2))

    assert_equal "INV-2026-0001", first.invoice_number
    assert_equal "INV-2026-0002", second.invoice_number
    assert_equal "INV-2027-0001", next_year.invoice_number
  end

  test "keeps an explicitly set number" do
    assert_equal "INV-2026-0042", create_invoice(invoice_number: "INV-2026-0042").invoice_number
  end

  test "holds the numbering lock until the creating transaction ends" do
    Invoice.transaction do
      create_invoice(issue_date: Date.new(2026, 3, 1))

      held = Invoice.connection.select_value(<<~SQL)
        SELECT count(*) FROM pg_locks
        WHERE locktype = 'advisory' AND pid = pg_backend_pid()
          AND classid = #{ApplicationRecord::ADVISORY_LOCK_NAMESPACES[:invoice_numbers]} AND objid = 2026
      SQL
      assert_equal 1, held
    end
  end

  test "totals line items and tax" do
    invoice = create_invoice(tax_rate: 10, line_items_attributes: [
      { description: "Consulting", quantity: 2, unit_price_cents: 15_000 },
      { description: "Hosting", quantity: 1, unit_price_cents: 5_000 }
    ])

    assert_equal 35_000, invoice.subtotal_cents
    assert_equal 3_500, invoice.tax_cents
    assert_equal 38_500, invoice.total_cents
    assert_equal "$385.00", invoice.formatted_total
  end

  test "marking paid and sent records the time" do
    invoice = create_invoice

    invoice.mark_as_sent!
    assert_equal "sent", invoice.status
    assert invoice.sent_at.present?

    invoice.mark_as_paid!
    assert_equal "paid", invoice.status
    assert invoice.paid_at.present?
  end

  private

  def create_invoice(**attributes)
    Invoice.create!({ client: @client, issue_date: Date.current, due_date: 30.days.from_now.to_date }.merge(attributes))
  end
end
