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

ActiveRecord::Schema[8.0].define(version: 2025_03_09_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

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
end
