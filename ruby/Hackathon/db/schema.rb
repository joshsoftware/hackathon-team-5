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

ActiveRecord::Schema.define(version: 2024_12_21_035239) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "actions", force: :cascade do |t|
    t.uuid "uid", default: -> { "gen_random_uuid()" }, null: false
    t.integer "flow"
    t.string "domain"
    t.string "explanation"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["uid"], name: "index_actions_on_uid", unique: true
  end

  create_table "issues", force: :cascade do |t|
    t.uuid "uid", default: -> { "gen_random_uuid()" }, null: false
    t.uuid "url_uid"
    t.uuid "action_uid"
    t.jsonb "issue", default: [], array: true
    t.integer "error_type"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["uid"], name: "index_issues_on_uid", unique: true
  end

  create_table "urls", force: :cascade do |t|
    t.uuid "uid", default: -> { "gen_random_uuid()" }, null: false
    t.uuid "action_uid"
    t.string "link"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["uid"], name: "index_urls_on_uid", unique: true
  end

  add_foreign_key "issues", "actions", column: "action_uid", primary_key: "uid"
  add_foreign_key "issues", "urls", column: "url_uid", primary_key: "uid"
  add_foreign_key "urls", "actions", column: "action_uid", primary_key: "uid"
end
