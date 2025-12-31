class CreateTtsBatches < ActiveRecord::Migration[8.0]
  def change
    create_table :tts_batches do |t|
      t.string :name
      t.string :status, default: "pending"
      t.integer :total_items, default: 0
      t.integer :completed_items, default: 0
      t.integer :failed_items, default: 0
      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end

    add_index :tts_batches, :status
  end
end
