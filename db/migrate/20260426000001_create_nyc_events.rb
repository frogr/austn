class CreateNycEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :nyc_venues do |t|
      t.string :name, null: false
      t.string :address
      t.string :neighborhood
      t.float :lat, null: false
      t.float :lng, null: false
      t.string :venue_type
      t.string :geocode_key
      t.jsonb :metadata, default: {}, null: false
      t.timestamps
    end
    add_index :nyc_venues, [ :lat, :lng ]
    add_index :nyc_venues, :geocode_key, unique: true
    add_index :nyc_venues, :name

    create_table :nyc_events do |t|
      t.string :title, null: false
      t.references :nyc_venue, foreign_key: true
      t.datetime :start_at, null: false
      t.datetime :end_at
      t.string :category, null: false
      t.string :subcategory
      t.string :price_text
      t.integer :price_min_cents
      t.text :description
      t.string :url
      t.string :image_url
      t.string :source, null: false
      t.string :source_id, null: false
      t.string :dedupe_hash, null: false
      t.timestamps
    end
    add_index :nyc_events, :start_at
    add_index :nyc_events, :category
    add_index :nyc_events, :dedupe_hash, unique: true
    add_index :nyc_events, [ :source, :source_id ], unique: true

    create_table :nyc_geocode_cache do |t|
      t.string :query, null: false
      t.float :lat
      t.float :lng
      t.string :display_name
      t.timestamps
    end
    add_index :nyc_geocode_cache, :query, unique: true
  end
end
