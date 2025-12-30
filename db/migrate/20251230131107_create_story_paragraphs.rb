class CreateStoryParagraphs < ActiveRecord::Migration[8.0]
  def change
    create_table :story_paragraphs do |t|
      t.references :story, null: false, foreign_key: true
      t.text :content, null: false
      t.integer :paragraph_number, null: false
      t.integer :token_count
      t.string :model_used
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :story_paragraphs, [ :story_id, :paragraph_number ], unique: true
    add_index :story_paragraphs, :created_at
  end
end
