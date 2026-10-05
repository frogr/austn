# The table only fed the public "recent models" gallery on /3d, which is gone.
# Generated GLBs live in Redis with their own TTL.
class DropThreeDModels < ActiveRecord::Migration[8.0]
  def change
    drop_table :three_d_models do |t|
      t.string :generation_id, null: false
      t.string :original_filename
      t.string :glb_filename
      t.text :thumbnail_data
      t.datetime :expires_at, null: false
      t.timestamps

      t.index :generation_id, unique: true
      t.index :expires_at
      t.index :created_at
    end
  end
end
