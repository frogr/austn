class CreateClaudeCornerEntries < ActiveRecord::Migration[8.0]
  # Kept local so this migration doesn't depend on the app model.
  class Entry < ActiveRecord::Base
    self.table_name = "claude_corner_entries"
  end

  SEED_FILE = Rails.root.join("db/seeds/claude_corner_entries.json")

  def change
    create_table :claude_corner_entries do |t|
      t.string :slug, null: false
      t.string :entry_type, null: false
      t.string :title, null: false
      t.text :content, null: false
      t.string :tags, array: true, null: false, default: []
      t.string :mood
      t.datetime :published_at

      t.timestamps
    end

    add_index :claude_corner_entries, :slug, unique: true
    add_index :claude_corner_entries, :published_at

    reversible do |direction|
      direction.up { import_existing_entries }
    end
  end

  private

  # Entries used to live in a JSON file bundled with the page; they come
  # across already published.
  def import_existing_entries
    Entry.reset_column_information

    JSON.parse(File.read(SEED_FILE)).each do |entry|
      Entry.create!(
        slug: entry.fetch("id"),
        entry_type: entry.fetch("type"),
        title: entry.fetch("title"),
        content: entry.fetch("content"),
        tags: entry.fetch("tags", []),
        mood: entry["mood"],
        published_at: entry.fetch("created_at"),
        created_at: entry.fetch("created_at")
      )
    end
  end
end
