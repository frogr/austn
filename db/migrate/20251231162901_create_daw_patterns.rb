class CreateDawPatterns < ActiveRecord::Migration[8.0]
  def change
    create_table :daw_patterns do |t|
      t.string :name, null: false
      t.text :description
      t.integer :bpm, default: 120
      t.integer :total_steps, default: 16
      t.integer :steps_per_measure, default: 16
      t.jsonb :data, default: {}
      t.string :tags, array: true, default: []
      t.boolean :is_template, default: false

      t.timestamps
    end

    add_index :daw_patterns, :tags, using: :gin
    add_index :daw_patterns, :is_template
    add_index :daw_patterns, :name
  end
end
