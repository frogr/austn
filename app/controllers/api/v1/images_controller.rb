module Api
  module V1
    class ImagesController < BaseController
      include GpuQueueStatus

      # POST /api/v1/images/generate
      # Synchronous — blocks until image is generated and returns result directly.
      # For long-running generations, use the async endpoint instead.
      def generate
        unless params[:prompt].present?
          return render_error("Prompt is required")
        end

        generation_id = SecureRandom.uuid
        request_id = SecureRandom.hex(8)
        Rails.logger.info "[Image API #{request_id}] Generate request: prompt=#{params[:prompt].truncate(100)}"

        options = build_options

        start_time = Time.current
        result = ComfyService.generate_image(
          params[:prompt],
          negative_prompt: options["negative_prompt"],
          seed: options["seed"],
          image_size: options["image_size"],
          batch_size: 1
        )
        elapsed = (Time.current - start_time).round(2)

        Rails.logger.info "[Image API #{request_id}] Generated image in #{elapsed}s"

        # Store in Redis so it can be served via the image URL
        image_data = {
          base64: result.is_a?(Array) ? result.first : result,
          prompt: params[:prompt],
          options: options,
          created_at: Time.current
        }
        image_redis_service.store_image(generation_id, image_data)

        seed_used = options["seed"] || "random"

        render json: {
          status: "completed",
          generation_id: generation_id,
          image_url: image_download_url(generation_id),
          seed: seed_used,
          generation_time: elapsed
        }

      rescue ComfyService::ComfyError => e
        Rails.logger.error "[Image API #{request_id}] ComfyUI error: #{e.message}"
        render_error(e.message, status: :service_unavailable)
      rescue => e
        Rails.logger.error "[Image API #{request_id}] Unexpected error: #{e.class} - #{e.message}"
        Rails.logger.error e.backtrace.first(5).join("\n")
        render_error("Internal server error", status: :internal_server_error)
      end

      # POST /api/v1/images/generate_async
      # Queues the job and returns immediately. Poll the status endpoint.
      def generate_async
        unless params[:prompt].present?
          return render_error("Prompt is required")
        end

        generation_id = SecureRandom.uuid
        options = build_options

        ImageGenerationJob.perform_later(
          generation_id,
          params[:prompt],
          options
        )

        render json: {
          generation_id: generation_id,
          status: "queued",
          status_url: "#{request.base_url}/api/v1/images/#{generation_id}/status"
        }, status: :accepted
      end

      # GET /api/v1/images/:id/status
      def status
        generation_id = params[:id]

        if image_redis_service.image_exists?(generation_id)
          image_data = image_redis_service.get_image(generation_id)

          render json: {
            status: "completed",
            generation_id: generation_id,
            image_url: image_download_url(generation_id),
            prompt: image_data["prompt"],
            created_at: image_data["created_at"]
          }
        else
          render json: status_with_queue_position(generation_id, image_redis_service)
        end
      end

      private

      def build_options
        options = {}
        options["negative_prompt"] = params[:negative_prompt] if params[:negative_prompt].present?
        options["seed"] = params[:seed].to_i if params[:seed].present? && params[:seed].to_i != -1
        options["image_size"] = params[:width].to_i if params[:width].present?
        options["image_size"] ||= params[:image_size].to_i if params[:image_size].present?
        options
      end

      def image_redis_service
        @image_redis_service ||= ImageRedisService.new
      end

      def image_download_url(generation_id)
        "#{request.base_url}/images/#{generation_id}/ai_image"
      end
    end
  end
end
