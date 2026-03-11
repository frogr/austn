class AddPatchTextToReviewSections < ActiveRecord::Migration[7.1]
  def change
    add_column :review_sections, :patch_text, :text
  end
end
