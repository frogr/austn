class CreateInvoiceLineItems < ActiveRecord::Migration[8.0]
  def change
    create_table :invoice_line_items do |t|
      t.references :invoice, null: false, foreign_key: true
      t.string :description, null: false
      t.decimal :quantity, precision: 10, scale: 2, null: false, default: 1
      t.integer :unit_price_cents, null: false, default: 0
      t.integer :total_cents, null: false, default: 0

      t.timestamps
    end
  end
end
