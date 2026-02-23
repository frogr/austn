class InvoicePdfService
  ACCENT_COLOR = "1DB954"

  def initialize(invoice)
    @invoice = invoice
    @client = invoice.client
  end

  def generate
    pdf = Prawn::Document.new(page_size: "LETTER", margin: [50, 50, 50, 50])

    draw_header(pdf)
    draw_divider(pdf)
    draw_bill_to(pdf)
    draw_line_items_table(pdf)
    draw_totals(pdf)
    draw_notes(pdf)
    draw_footer(pdf)

    pdf.render
  end

  private

  def draw_header(pdf)
    pdf.font "Helvetica"

    # Left side - sender info
    pdf.bounding_box([0, pdf.cursor], width: 300) do
      pdf.font("Helvetica", style: :bold, size: 22) { pdf.text "AUSTIN FRENCH" }
      pdf.move_down 4
      pdf.font("Helvetica", size: 10) do
        pdf.fill_color "666666"
        pdf.text "Senior Software Engineer"
        pdf.text "Turlock, CA"
        pdf.text "hi@austn.net"
        pdf.text "austn.net"
        pdf.fill_color "000000"
      end
    end

    # Right side - invoice meta
    top = pdf.bounds.top
    pdf.bounding_box([pdf.bounds.width - 200, top], width: 200) do
      pdf.fill_color "999999"
      pdf.font("Helvetica", style: :bold, size: 28) do
        pdf.text "INVOICE", align: :right
      end
      pdf.move_down 4
      pdf.fill_color "333333"
      pdf.font("Helvetica", size: 11) do
        pdf.text @invoice.invoice_number, align: :right
      end
      pdf.move_down 10
      pdf.fill_color "666666"
      pdf.font("Helvetica", size: 10) do
        pdf.text "Date: #{@invoice.issue_date.strftime('%b %d, %Y')}", align: :right
        pdf.text "Due: #{@invoice.due_date.strftime('%b %d, %Y')}", align: :right
      end
      pdf.fill_color "000000"
    end

    pdf.move_down 20
  end

  def draw_divider(pdf)
    pdf.fill_color ACCENT_COLOR
    pdf.fill_rectangle [0, pdf.cursor], pdf.bounds.width, 2
    pdf.fill_color "000000"
    pdf.move_down 20
  end

  def draw_bill_to(pdf)
    pdf.fill_color "999999"
    pdf.font("Helvetica", style: :bold, size: 9) { pdf.text "BILL TO" }
    pdf.move_down 6
    pdf.fill_color "333333"
    pdf.font("Helvetica", style: :bold, size: 11) { pdf.text @client.name }
    pdf.font("Helvetica", size: 10) do
      pdf.text @client.address_line1
      pdf.text @client.address_line2 if @client.address_line2.present?
      pdf.text "#{@client.city}, #{@client.state} #{@client.zip}"
    end
    pdf.fill_color "000000"
    pdf.move_down 25
  end

  def draw_line_items_table(pdf)
    header = [
      { content: "Description", font_style: :bold },
      { content: "Qty", font_style: :bold, align: :right },
      { content: "Rate", font_style: :bold, align: :right },
      { content: "Amount", font_style: :bold, align: :right }
    ]

    rows = @invoice.line_items.map do |li|
      qty_display = li.quantity % 1 == 0 ? li.quantity.to_i.to_s : li.quantity.to_s
      [
        li.description,
        { content: qty_display, align: :right },
        { content: format_money(li.unit_price_cents), align: :right },
        { content: format_money(li.total_cents), align: :right }
      ]
    end

    pdf.table([header] + rows, width: pdf.bounds.width, cell_style: { size: 10, padding: [8, 6] }) do |t|
      t.row(0).font_style = :bold
      t.row(0).text_color = "999999"
      t.row(0).size = 9
      t.row(0).borders = [:bottom]
      t.row(0).border_width = 1
      t.row(0).border_color = "E5E5E5"

      t.columns(0).width = pdf.bounds.width * 0.5
      t.columns(1).width = pdf.bounds.width * 0.12
      t.columns(2).width = pdf.bounds.width * 0.19
      t.columns(3).width = pdf.bounds.width * 0.19

      (1..rows.length).each do |i|
        t.row(i).borders = [:bottom]
        t.row(i).border_width = 0.5
        t.row(i).border_color = "F0F0F0"
        t.row(i).text_color = "333333"
      end

      t.cells.border_left_width = 0
      t.cells.border_right_width = 0
    end

    pdf.move_down 15
  end

  def draw_totals(pdf)
    totals_x = pdf.bounds.width - 220

    pdf.bounding_box([totals_x, pdf.cursor], width: 220) do
      # Subtotal
      draw_total_row(pdf, "Subtotal", format_money(@invoice.subtotal_cents))

      # Tax
      tax_label = "Tax (#{@invoice.tax_rate}%)"
      draw_total_row(pdf, tax_label, format_money(@invoice.tax_cents))

      pdf.move_down 4
      pdf.fill_color ACCENT_COLOR
      pdf.fill_rectangle [0, pdf.cursor], 220, 2
      pdf.fill_color "000000"
      pdf.move_down 8

      # Total
      pdf.font("Helvetica", style: :bold, size: 13) do
        pdf.text_box "TOTAL", at: [0, pdf.cursor], width: 110
        pdf.fill_color ACCENT_COLOR
        pdf.text_box format_money(@invoice.total_cents), at: [110, pdf.cursor], width: 110, align: :right
        pdf.fill_color "000000"
      end
      pdf.move_down 20
    end
  end

  def draw_total_row(pdf, label, amount)
    pdf.font("Helvetica", size: 10) do
      start_y = pdf.cursor
      pdf.fill_color "666666"
      pdf.text_box label, at: [0, start_y], width: 110
      pdf.fill_color "333333"
      pdf.text_box amount, at: [110, start_y], width: 110, align: :right
      pdf.fill_color "000000"
    end
    pdf.move_down 18
  end

  def draw_notes(pdf)
    return unless @invoice.notes.present?

    pdf.move_down 15
    pdf.stroke_color "F0F0F0"
    pdf.stroke_horizontal_line 0, pdf.bounds.width
    pdf.move_down 15

    pdf.fill_color "999999"
    pdf.font("Helvetica", style: :bold, size: 9) { pdf.text "NOTES" }
    pdf.move_down 4
    pdf.fill_color "666666"
    pdf.font("Helvetica", size: 10) { pdf.text @invoice.notes }
    pdf.fill_color "000000"
  end

  def draw_footer(pdf)
    pdf.move_down 30
    pdf.fill_color "999999"
    pdf.font("Helvetica", size: 11) do
      pdf.text "Thank you for your business!", align: :center
    end
    pdf.move_down 4
    pdf.font("Helvetica", size: 10) do
      pdf.text "austn.net", align: :center
    end
    pdf.fill_color "000000"
  end

  def format_money(cents)
    return "$0.00" if cents.nil? || cents == 0
    dollars = cents.to_f / 100
    formatted = format("%.2f", dollars)
    parts = formatted.split(".")
    parts[0] = parts[0].gsub(/(\d)(?=(\d{3})+(?!\d))/, '\\1,')
    "$#{parts.join('.')}"
  end
end
