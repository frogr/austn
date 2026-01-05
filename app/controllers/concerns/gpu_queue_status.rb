# Provides helpers for checking GPU job queue status.
# Include in controllers that handle GPU-intensive generation requests.
#
# Example:
#   class TtsController < ApplicationController
#     include GpuQueueStatus
#
#     def status
#       if redis_service.result_exists?(generation_id)
#         render json: { status: "complete", ... }
#       else
#         render json: status_with_queue_position(generation_id, redis_service)
#       end
#     end
#   end
#
module GpuQueueStatus
  extend ActiveSupport::Concern

  private

  # Get status with queue position if job is pending
  def status_with_queue_position(generation_id, redis_service)
    status = redis_service.get_status(generation_id)
    status_value = status[:status] || status["status"]

    return status unless status_value == "pending"

    queue_position = gpu_queue_position(generation_id)
    return status unless queue_position

    { "status" => "queued", "position" => queue_position + 1 }
  end

  # Find position of job in GPU queue (0-indexed, nil if not found)
  def gpu_queue_position(generation_id)
    Sidekiq::Queue.new("gpu").find_index do |job|
      job.args.first == generation_id
    end
  end
end
