class CreateAvailabilityRules < ActiveRecord::Migration[8.0]
  def change
    create_table :availability_rules do |t|
      t.integer :weekday, null: false # 0 = Sunday, as in Date#wday
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.integer :slot_duration_minutes, null: false, default: 30
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :availability_rules, [ :weekday, :active ]
  end
end
