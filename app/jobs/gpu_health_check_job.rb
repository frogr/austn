class GpuHealthCheckJob < ApplicationJob
  queue_as :default

  def perform
    results = GpuHealthService.check_all
    Rails.logger.info "GpuHealthCheckJob: #{results.inspect}"
  end
end
