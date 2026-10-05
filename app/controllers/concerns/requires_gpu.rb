# Refuses generation requests while a tool's GPU backend is unconfigured or
# marked offline, so nothing is queued that can't run.
#
#   class RembgController < ApplicationController
#     include RequiresGpu
#     requires_gpu "rembg", only: :generate
#   end
module RequiresGpu
  extend ActiveSupport::Concern

  class_methods do
    def requires_gpu(tool, **options)
      before_action(-> { require_gpu!(tool) }, **options)
    end
  end

  private

  def require_gpu!(tool)
    return if gpu_available?(tool)

    render json: { success: false, status: "offline", **Gpu::PublicError.new(:gpu_offline).to_h },
           status: :service_unavailable
  end

  def gpu_available?(tool)
    Gpu::Backend.configured?(Gpu::Backend.for_tool(tool)) && GpuHealthStatus.online?(tool)
  end

  # Logs a failure in full and answers with a visitor-safe JSON error.
  def render_gpu_error(error)
    Rails.logger.error "#{self.class.name}##{action_name} failed: #{error.class}: #{error.message}"
    public_error = Gpu::PublicError.for(error)
    status = public_error.code == :gpu_offline ? :service_unavailable : :internal_server_error

    render json: { success: false, **public_error.to_h }, status: status
  end
end
