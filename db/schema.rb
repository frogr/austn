# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_09_24_052633) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "blog_posts", force: :cascade do |t|
    t.string "title", null: false
    t.text "content", null: false
    t.string "slug", null: false
    t.datetime "published_at"
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["published_at"], name: "index_blog_posts_on_published_at"
    t.index ["slug"], name: "index_blog_posts_on_slug", unique: true
  end

  create_table "game_posts", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.string "slug", null: false
    t.string "image_url", null: false
    t.string "link", null: false
    t.boolean "featured", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_game_posts_on_slug", unique: true
  end

  create_table "images", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.integer "position"
    t.boolean "published"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "items", force: :cascade do |t|
    t.string "name", null: false
    t.string "category"
    t.integer "weight", default: 0
    t.integer "value", default: 0
    t.integer "damage", default: 0
    t.integer "defense", default: 0
    t.boolean "equipped", default: false
    t.integer "quantity", default: 1
    t.string "owner_type"
    t.integer "owner_id"
    t.bigint "location_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["location_id"], name: "index_items_on_location_id"
    t.index ["owner_type", "owner_id"], name: "index_items_on_owner_type_and_owner_id"
  end

  create_table "locations", force: :cascade do |t|
    t.string "name"
    t.string "location_type"
    t.text "description"
    t.integer "danger_level"
    t.json "exits"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "players", force: :cascade do |t|
    t.string "name", null: false
    t.integer "level", default: 1
    t.integer "xp", default: 0
    t.integer "hp", default: 100
    t.integer "max_hp", default: 100
    t.integer "ap", default: 100
    t.integer "max_ap", default: 100
    t.integer "strength", default: 5
    t.integer "perception", default: 5
    t.integer "endurance", default: 5
    t.integer "charisma", default: 5
    t.integer "intelligence", default: 5
    t.integer "agility", default: 5
    t.integer "luck", default: 5
    t.integer "caps", default: 0
    t.integer "carry_weight", default: 0
    t.integer "max_carry_weight", default: 200
    t.integer "radiation", default: 0
    t.bigint "current_location_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["current_location_id"], name: "index_players_on_current_location_id"
  end

  create_table "service_statuses", force: :cascade do |t|
    t.string "name"
    t.string "status"
    t.datetime "last_check"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "technology_statuses", force: :cascade do |t|
    t.string "name"
    t.string "status"
    t.datetime "last_checked"
    t.text "details"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "work_posts", force: :cascade do |t|
    t.string "title", null: false
    t.text "description", null: false
    t.string "slug", null: false
    t.string "image_url", null: false
    t.string "tags", default: [], null: false, array: true
    t.boolean "featured", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_work_posts_on_slug", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "items", "locations"
  add_foreign_key "players", "locations", column: "current_location_id"
end
