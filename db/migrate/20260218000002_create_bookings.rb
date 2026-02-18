class CreateBookings < ActiveRecord::Migration[8.0]
  def change
    create_table :bookings do |t|
      t.references :availability, null: false, foreign_key: true
      t.date :booked_date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.string :first_name, null: false
      t.string :email, null: false
      t.string :phone_number, null: false
      t.text :notes
      t.string :status, default: "confirmed", null: false
      t.string :confirmation_token, null: false
      t.datetime :cancelled_at

      t.timestamps
    end

    add_index :bookings, [ :booked_date, :start_time ]
    add_index :bookings, :confirmation_token, unique: true
    add_index :bookings, :status
    add_index :bookings, :email
  end
end
