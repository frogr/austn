class CreateGpuHealthStatuses < ActiveRecord::Migration[8.0]
  def change
    create_table :gpu_health_statuses do |t|
      t.string :service_name, null: false
      t.boolean :online, default: false
      t.datetime :last_checked_at
      t.datetime :last_online_at
      t.text :error_message

      t.timestamps
    end
    add_index :gpu_health_statuses, :service_name, unique: true
  end
end
