# Refuses generation requests while a tool's GPU backend is unconfigured or
# marked offline, so nothing is queued that can't run.
#
#   class RembgController < ApplicationController
#     include RequiresGpu
#     requires_gpu "rembg", only: :generate
#     shows_writeup_when_offline "rembg", "background-removal", only: :index
#   end
module RequiresGpu
  extend ActiveSupport::Concern

  class_methods do
    def requires_gpu(tool, **options)
      before_action(-> { require_gpu!(tool) }, **options)
    end

    # While the GPU is offline, send visitors to the tool's write-up in the
    # Playground instead of a form that can't do anything.
    def shows_writeup_when_offline(tool, playground_slug, **options)
      before_action(-> { redirect_to playground_item_path(playground_slug) unless gpu_available?(tool) }, **options)
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

  # Answers a request the GPU should never see. The message must be safe to show.
  def render_invalid_input(message)
    render json: { success: false, **Gpu::PublicError.new(:invalid_input, message).to_h }, status: :unprocessable_entity
  end

  # Logs a failure in full and answers with a visitor-safe JSON error.
  def render_gpu_error(error)
    Rails.logger.error "#{self.class.name}##{action_name} failed: #{error.class}: #{error.message}"
    public_error = Gpu::PublicError.for(error)
    status = public_error.code == :gpu_offline ? :service_unavailable : :internal_server_error

    render json: { success: false, **public_error.to_h }, status: status
  end
end
