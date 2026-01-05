class CreateThreeDModels < ActiveRecord::Migration[8.0]
  def change
    create_table :three_d_models do |t|
      t.string :generation_id, null: false
      t.string :original_filename
      t.string :glb_filename
      t.text :thumbnail_data
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :three_d_models, :generation_id, unique: true
    add_index :three_d_models, :expires_at
    add_index :three_d_models, :created_at
  end
end
