class CreateVisitsAndVisitEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :visits do |t|
      t.string :visitor_id, null: false
      t.string :ip
      t.string :user_agent
      t.string :browser
      t.string :os
      t.string :device
      t.string :landing_path, null: false
      t.string :referrer
      t.string :referrer_host
      t.string :source, null: false
      t.string :medium, null: false
      t.string :campaign
      t.string :content
      t.string :term
      t.string :ref
      t.string :country
      t.string :region
      t.string :city
      t.string :org
      t.datetime :started_at, null: false
      t.datetime :last_seen_at, null: false
      t.integer :page_views_count, null: false, default: 0
      t.timestamps
    end
    add_index :visits, [ :visitor_id, :last_seen_at ]
    add_index :visits, :started_at
    add_index :visits, :source

    create_table :visit_events do |t|
      t.references :visit, null: false, foreign_key: true
      t.string :name, null: false
      t.string :path
      t.string :referrer_path
      t.string :label
      t.string :href
      t.datetime :created_at, null: false
    end
    add_index :visit_events, [ :name, :created_at ]
    add_index :visit_events, [ :path, :created_at ]
  end
end
