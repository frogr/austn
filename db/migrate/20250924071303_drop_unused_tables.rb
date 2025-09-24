class DropUnusedTables < ActiveRecord::Migration[8.0]
  def up
    # Drop foreign key constraints first
    remove_foreign_key :items, :locations if foreign_key_exists?(:items, :locations)
    remove_foreign_key :players, :locations if foreign_key_exists?(:players, :locations)

    # Drop unused tables
    drop_table :items if table_exists?(:items)
    drop_table :players if table_exists?(:players)
    drop_table :locations if table_exists?(:locations)
    drop_table :game_posts if table_exists?(:game_posts)
    drop_table :work_posts if table_exists?(:work_posts)
    drop_table :service_statuses if table_exists?(:service_statuses)
    drop_table :technology_statuses if table_exists?(:technology_statuses)
  end

  def down
    raise ActiveRecord::IrreversibleMigration, "Cannot recreate dropped tables without full schema definitions"
  end
end
