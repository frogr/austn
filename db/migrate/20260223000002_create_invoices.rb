class CreateInvoices < ActiveRecord::Migration[8.0]
  def change
    create_table :invoices do |t|
      t.references :client, null: false, foreign_key: true
      t.string :invoice_number, null: false
      t.date :issue_date, null: false
      t.date :due_date, null: false
      t.string :status, null: false, default: "draft"
      t.text :notes
      t.integer :subtotal_cents, null: false, default: 0
      t.decimal :tax_rate, precision: 5, scale: 2, null: false, default: 0
      t.integer :tax_cents, null: false, default: 0
      t.integer :total_cents, null: false, default: 0
      t.datetime :paid_at
      t.datetime :sent_at

      t.timestamps
    end

    add_index :invoices, :invoice_number, unique: true
    add_index :invoices, :status
    add_index :invoices, :due_date
  end
end
