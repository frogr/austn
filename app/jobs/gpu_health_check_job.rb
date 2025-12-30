class GpuHealthCheckJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info "GpuHealthCheckJob: Checking GPU service health..."
    results = GpuHealthService.check_all
    Rails.logger.info "GpuHealthCheckJob: Results - #{results.inspect}"
  end
end
