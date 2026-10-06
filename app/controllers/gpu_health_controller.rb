class GpuHealthController < ApplicationController
  before_action :authenticate_admin!, only: :check
  before_action :require_known_service, only: [ :show, :check ]

  def index
    render json: GpuHealthStatus.all_statuses
  end

  def show
    render json: { service: params[:service], **GpuHealthStatus.for_service(params[:service]).public_status }
  end

  # Admin-only: probes the backends right now instead of waiting for the schedule.
  def check
    if params[:service].present?
      GpuHealthService.new.check(params[:service])
      render json: { service: params[:service], **GpuHealthStatus.for_service(params[:service]).public_status }
    else
      GpuHealthService.check_all
      render json: GpuHealthStatus.all_statuses
    end
  end

  private

  def require_known_service
    return if params[:service].blank? && action_name == "check"
    return if GpuHealthStatus::SERVICES.include?(params[:service])

    render json: { error: "Unknown service" }, status: :not_found
  end
end
