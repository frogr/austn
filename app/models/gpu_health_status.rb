# Last known state of each GPU tool, written by GpuHealthService and by GPU
# jobs as they succeed or find the backend gone. error_message is for the
# logs and the admin; it is never shown to visitors.
class GpuHealthStatus < ApplicationRecord
  SERVICES = Gpu::Backend::TOOLS.keys.freeze

  validates :service_name, presence: true, uniqueness: true, inclusion: { in: SERVICES }

  def self.for_service(name)
    find_by(service_name: name) || create_or_find_by!(service_name: name)
  end

  def self.online?(name)
    where(service_name: name, online: true).exists?
  end

  # Visitor-safe summary for the public /gpu_health endpoint.
  def self.all_statuses
    SERVICES.index_with { |service| for_service(service).public_status }
  end

  def public_status
    { online: online, last_checked_at: last_checked_at, last_online_at: last_online_at }
  end

  def mark_online!
    update!(
      online: true,
      last_checked_at: Time.current,
      last_online_at: Time.current,
      error_message: nil
    )
  end

  def mark_offline!(error = nil)
    update!(
      online: false,
      last_checked_at: Time.current,
      error_message: error
    )
  end
end
