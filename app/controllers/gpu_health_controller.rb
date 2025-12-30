class GpuHealthController < ApplicationController
  def index
    render json: GpuHealthStatus.all_statuses
  end

  def show
    service = params[:service]
    unless GpuHealthStatus::SERVICES.include?(service)
      return render json: { error: "Unknown service" }, status: :not_found
    end

    status = GpuHealthStatus.for_service(service)
    render json: {
      service: service,
      online: status.online,
      last_checked_at: status.last_checked_at,
      last_online_at: status.last_online_at,
      error_message: status.error_message
    }
  end

  def check
    service = params[:service]

    if service.present?
      unless GpuHealthStatus::SERVICES.include?(service)
        return render json: { error: "Unknown service" }, status: :not_found
      end

      health_service = GpuHealthService.new
      result = health_service.public_send("check_#{service}")
      status = GpuHealthStatus.for_service(service)

      render json: {
        service: service,
        online: result,
        last_checked_at: status.last_checked_at,
        last_online_at: status.last_online_at
      }
    else
      results = GpuHealthService.check_all
      render json: GpuHealthStatus.all_statuses
    end
  end
end
