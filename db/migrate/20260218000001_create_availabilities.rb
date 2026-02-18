class CreateAvailabilities < ActiveRecord::Migration[8.0]
  def change
    create_table :availabilities do |t|
      t.date :date, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.integer :slot_duration_minutes, default: 30, null: false
      t.boolean :is_active, default: true, null: false
      t.string :title
      t.text :description
      t.integer :max_bookings_per_slot, default: 1, null: false

      t.timestamps
    end

    add_index :availabilities, :date
    add_index :availabilities, [ :date, :is_active ]
  end
end
