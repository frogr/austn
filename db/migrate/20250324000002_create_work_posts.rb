class CreateWorkPosts < ActiveRecord::Migration[7.1]
  def change
    create_table :work_posts do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.string :slug, null: false
      t.string :image_url, null: false
      t.string :tags, null: false, array: true, default: []
      t.boolean :featured, default: false

      t.timestamps
    end
    add_index :work_posts, :slug, unique: true
  end
end