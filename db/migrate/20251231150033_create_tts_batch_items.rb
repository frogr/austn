class CreateTtsBatchItems < ActiveRecord::Migration[8.0]
  def change
    create_table :tts_batch_items do |t|
      t.references :tts_batch, null: false, foreign_key: true
      t.text :text, null: false
      t.string :voice_preset
      t.float :exaggeration, default: 0.5
      t.float :cfg_weight, default: 0.5
      t.integer :position, null: false
      t.string :status, default: "pending"
      t.text :audio_data
      t.float :duration
      t.text :error_message
      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end

    add_index :tts_batch_items, [ :tts_batch_id, :position ]
    add_index :tts_batch_items, :status
  end
end
