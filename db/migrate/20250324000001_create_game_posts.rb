class CreateGamePosts < ActiveRecord::Migration[7.1]
  def change
    create_table :game_posts do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.string :slug, null: false
      t.string :image_url, null: false
      t.string :link, null: false
      t.boolean :featured, default: false

      t.timestamps
    end
    add_index :game_posts, :slug, unique: true
  end
end