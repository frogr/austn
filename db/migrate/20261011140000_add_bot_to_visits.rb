class AddBotToVisits < ActiveRecord::Migration[8.0]
  def change
    add_column :visits, :bot, :boolean, null: false, default: false
    add_index :visits, [ :bot, :started_at ]
  end
end
