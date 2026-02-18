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

ActiveRecord::Schema[8.0].define(version: 2026_02_18_000002) do
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

  create_table "availabilities", force: :cascade do |t|
    t.date "date", null: false
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.integer "slot_duration_minutes", default: 30, null: false
    t.boolean "is_active", default: true, null: false
    t.string "title"
    t.text "description"
    t.integer "max_bookings_per_slot", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["date", "is_active"], name: "index_availabilities_on_date_and_is_active"
    t.index ["date"], name: "index_availabilities_on_date"
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

  create_table "bookings", force: :cascade do |t|
    t.bigint "availability_id", null: false
    t.date "booked_date", null: false
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.string "first_name", null: false
    t.string "email", null: false
    t.string "phone_number", null: false
    t.text "notes"
    t.string "status", default: "confirmed", null: false
    t.string "confirmation_token", null: false
    t.datetime "cancelled_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["availability_id"], name: "index_bookings_on_availability_id"
    t.index ["booked_date", "start_time"], name: "index_bookings_on_booked_date_and_start_time"
    t.index ["confirmation_token"], name: "index_bookings_on_confirmation_token", unique: true
    t.index ["email"], name: "index_bookings_on_email"
    t.index ["status"], name: "index_bookings_on_status"
  end

  create_table "daw_patterns", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.integer "bpm", default: 120
    t.integer "total_steps", default: 16
    t.integer "steps_per_measure", default: 16
    t.jsonb "data", default: {}
    t.string "tags", default: [], array: true
    t.boolean "is_template", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["is_template"], name: "index_daw_patterns_on_is_template"
    t.index ["name"], name: "index_daw_patterns_on_name"
    t.index ["tags"], name: "index_daw_patterns_on_tags", using: :gin
  end

  create_table "gpu_health_statuses", force: :cascade do |t|
    t.string "service_name", null: false
    t.boolean "online", default: false
    t.datetime "last_checked_at"
    t.datetime "last_online_at"
    t.text "error_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_name"], name: "index_gpu_health_statuses_on_service_name", unique: true
  end

  create_table "images", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.integer "position"
    t.boolean "published"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "stories", force: :cascade do |t|
    t.string "title", null: false
    t.text "system_prompt", null: false
    t.boolean "active", default: true, null: false
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_stories_on_active"
  end

  create_table "story_paragraphs", force: :cascade do |t|
    t.bigint "story_id", null: false
    t.text "content", null: false
    t.integer "paragraph_number", null: false
    t.integer "token_count"
    t.string "model_used"
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_story_paragraphs_on_created_at"
    t.index ["story_id", "paragraph_number"], name: "index_story_paragraphs_on_story_id_and_paragraph_number", unique: true
    t.index ["story_id"], name: "index_story_paragraphs_on_story_id"
  end

  create_table "three_d_models", force: :cascade do |t|
    t.string "generation_id", null: false
    t.string "original_filename"
    t.string "glb_filename"
    t.text "thumbnail_data"
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_three_d_models_on_created_at"
    t.index ["expires_at"], name: "index_three_d_models_on_expires_at"
    t.index ["generation_id"], name: "index_three_d_models_on_generation_id", unique: true
  end

  create_table "tts_batch_items", force: :cascade do |t|
    t.bigint "tts_batch_id", null: false
    t.text "text", null: false
    t.string "voice_preset"
    t.float "exaggeration", default: 0.5
    t.float "cfg_weight", default: 0.5
    t.integer "position", null: false
    t.string "status", default: "pending"
    t.text "audio_data"
    t.float "duration"
    t.text "error_message"
    t.datetime "started_at"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_tts_batch_items_on_status"
    t.index ["tts_batch_id", "position"], name: "index_tts_batch_items_on_tts_batch_id_and_position"
    t.index ["tts_batch_id"], name: "index_tts_batch_items_on_tts_batch_id"
  end

  create_table "tts_batches", force: :cascade do |t|
    t.string "name"
    t.string "status", default: "pending"
    t.integer "total_items", default: 0
    t.integer "completed_items", default: 0
    t.integer "failed_items", default: 0
    t.datetime "started_at"
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_tts_batches_on_status"
  end

  create_table "tts_shares", force: :cascade do |t|
    t.string "token"
    t.text "audio_data"
    t.text "text"
    t.float "duration"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "voice_preset"
    t.index ["expires_at"], name: "index_tts_shares_on_expires_at"
    t.index ["token"], name: "index_tts_shares_on_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "bookings", "availabilities"
  add_foreign_key "story_paragraphs", "stories"
  add_foreign_key "tts_batch_items", "tts_batches"
end
