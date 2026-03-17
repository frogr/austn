class AddMissingIndexes < ActiveRecord::Migration[8.0]
  def change
    add_index :images, :published
    add_index :images, :position
    add_index :review_sections, :status
    add_index :reviews, :pr_url
  end
end
