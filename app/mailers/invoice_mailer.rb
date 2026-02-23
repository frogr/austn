class InvoiceMailer < ApplicationMailer
  helper InvoicesHelper

  def send_invoice(invoice)
    @invoice = invoice
    @client = invoice.client

    pdf_data = InvoicePdfService.new(invoice).generate
    attachments["#{invoice.invoice_number}.pdf"] = {
      mime_type: "application/pdf",
      content: pdf_data
    }

    mail(
      to: @client.email,
      subject: "Invoice #{invoice.invoice_number} from Austin French"
    )
  end
end
