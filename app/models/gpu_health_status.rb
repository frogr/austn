class GpuHealthStatus < ApplicationRecord
  SERVICES = %w[images tts chat].freeze

  validates :service_name, presence: true, uniqueness: true, inclusion: { in: SERVICES }

  scope :by_service, ->(name) { find_by(service_name: name) }

  def self.for_service(name)
    find_or_create_by(service_name: name)
  end

  def self.all_statuses
    SERVICES.each_with_object({}) do |service, hash|
      status = for_service(service)
      hash[service] = {
        online: status.online,
        last_checked_at: status.last_checked_at,
        last_online_at: status.last_online_at,
        error_message: status.error_message
      }
    end
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
