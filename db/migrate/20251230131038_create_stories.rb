class CreateStories < ActiveRecord::Migration[8.0]
  def change
    create_table :stories do |t|
      t.string :title, null: false
      t.text :system_prompt, null: false
      t.boolean :active, default: true, null: false
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :stories, :active
  end
end
