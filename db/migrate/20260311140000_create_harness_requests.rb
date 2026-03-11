class CreateHarnessRequests < ActiveRecord::Migration[7.1]
  def change
    create_table :harness_requests do |t|
      t.references :review, null: true, foreign_key: true
      t.string :request_type, null: false # triage, section_review, synthesis
      t.string :provider, null: false     # openai, anthropic
      t.string :model, null: false
      t.string :status, default: "pending" # pending, success, error
      t.text :system_prompt
      t.text :user_prompt
      t.text :raw_response
      t.integer :input_tokens, default: 0
      t.integer :output_tokens, default: 0
      t.decimal :estimated_cost, precision: 10, scale: 6, default: 0
      t.float :duration_seconds
      t.text :error_message
      t.timestamps
    end

    add_index :harness_requests, :request_type
    add_index :harness_requests, :created_at

    # Add a decision field to reviews for the admin action
    add_column :reviews, :decision, :string
    add_column :reviews, :decision_comment, :text
  end
end
