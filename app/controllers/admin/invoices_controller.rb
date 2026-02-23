module Admin
  class InvoicesController < BaseController
    before_action :set_invoice, only: %i[show edit update destroy preview pdf send_invoice mark_paid duplicate]

    def index
      @invoices = Invoice.includes(:client).order(created_at: :desc)

      if params[:status].present? && params[:status] != "all"
        @invoices = @invoices.where(status: params[:status])
      end

      @total_outstanding_cents = Invoice.outstanding.sum(:total_cents)
      @total_paid_this_month_cents = Invoice.paid
        .where(paid_at: Time.current.beginning_of_month..Time.current.end_of_month)
        .sum(:total_cents)
      @total_paid_all_time_cents = Invoice.paid.sum(:total_cents)
    end

    def show
    end

    def new
      @invoice = Invoice.new(
        issue_date: Date.current,
        due_date: Date.current + 30.days,
        tax_rate: 0,
        client_id: params[:client_id]
      )
      @invoice.line_items.build
      @clients = Client.order(:name)
    end

    def create
      @invoice = Invoice.new(invoice_params)
      if @invoice.save
        redirect_to admin_invoice_path(@invoice), notice: "Invoice created."
      else
        @clients = Client.order(:name)
        render :new, status: :unprocessable_entity
      end
    end

    def edit
      @clients = Client.order(:name)
      @invoice.line_items.build if @invoice.line_items.empty?
    end

    def update
      if @invoice.update(invoice_params)
        redirect_to admin_invoice_path(@invoice), notice: "Invoice updated."
      else
        @clients = Client.order(:name)
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @invoice.destroy
      redirect_to admin_invoices_path, notice: "Invoice deleted."
    end

    def preview
      render layout: false
    end

    def pdf
      pdf_data = InvoicePdfService.new(@invoice).generate
      send_data pdf_data,
        filename: "#{@invoice.invoice_number}.pdf",
        type: "application/pdf",
        disposition: "inline"
    end

    def send_invoice
      InvoiceMailer.send_invoice(@invoice).deliver_later
      @invoice.mark_as_sent!
      redirect_to admin_invoice_path(@invoice), notice: "Invoice sent to #{@invoice.client.email}."
    end

    def mark_paid
      @invoice.mark_as_paid!
      redirect_to admin_invoice_path(@invoice), notice: "Invoice marked as paid."
    end

    def duplicate
      new_invoice = @invoice.dup
      new_invoice.invoice_number = nil
      new_invoice.status = "draft"
      new_invoice.sent_at = nil
      new_invoice.paid_at = nil
      new_invoice.issue_date = Date.current
      new_invoice.due_date = Date.current + 30.days

      @invoice.line_items.each do |li|
        new_invoice.line_items.build(
          description: li.description,
          quantity: li.quantity,
          unit_price_cents: li.unit_price_cents
        )
      end

      if new_invoice.save
        redirect_to edit_admin_invoice_path(new_invoice), notice: "Invoice duplicated."
      else
        redirect_to admin_invoice_path(@invoice), alert: "Failed to duplicate invoice."
      end
    end

    private

    def set_invoice
      @invoice = Invoice.includes(:client, :line_items).find(params[:id])
    end

    def invoice_params
      params.require(:invoice).permit(
        :client_id, :issue_date, :due_date, :status, :notes, :tax_rate,
        line_items_attributes: [:id, :description, :quantity, :unit_price_cents, :_destroy]
      )
    end
  end
end
