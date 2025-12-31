class AddVoicePresetToTtsShares < ActiveRecord::Migration[8.0]
  def change
    add_column :tts_shares, :voice_preset, :string
  end
end
