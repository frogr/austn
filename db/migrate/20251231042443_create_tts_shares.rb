class CreateTtsShares < ActiveRecord::Migration[8.0]
  def change
    create_table :tts_shares do |t|
      t.string :token
      t.text :audio_data
      t.text :text
      t.float :duration
      t.datetime :expires_at

      t.timestamps
    end
    add_index :tts_shares, :token, unique: true
    add_index :tts_shares, :expires_at
  end
end
