class CreateReviews < ActiveRecord::Migration[7.1]
  def change
    create_table :reviews do |t|
      t.string :pr_url, null: false
      t.string :repo_name
      t.integer :pr_number
      t.string :status, default: "pending"
      t.jsonb :triage_result, default: {}
      t.jsonb :synthesis_result, default: {}
      t.integer :total_findings, default: 0
      t.integer :red_flags, default: 0
      t.integer :warnings, default: 0
      t.timestamps
    end

    create_table :review_sections do |t|
      t.references :review, null: false, foreign_key: true
      t.string :filename, null: false
      t.string :language
      t.string :priority
      t.text :walkthrough
      t.jsonb :findings, default: []
      t.jsonb :human_comments, default: []
      t.string :status, default: "pending"
      t.timestamps
    end
  end
end
