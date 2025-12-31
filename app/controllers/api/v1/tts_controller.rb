module Api
  module V1
    class TtsController < BaseController
      # POST /api/v1/tts/generate
      def generate
        unless params[:text].present?
          return render_error("Text is required")
        end

        generation_id = SecureRandom.uuid

        options = {
          "exaggeration" => params[:exaggeration] || 0.5,
          "cfg_weight" => params[:cfg_weight] || 0.5
        }
        options["voice_preset"] = params[:voice_preset] if params[:voice_preset].present?

        TtsGenerationJob.perform_later(generation_id, params[:text], options)

        render json: {
          generation_id: generation_id,
          status: "queued",
          status_url: api_v1_tts_status_url(generation_id)
        }, status: :accepted
      end

      # GET /api/v1/tts/:id/status
      def status
        generation_id = params[:id]
        service = TtsRedisService.new

        if service.audio_exists?(generation_id)
          audio_data = service.get_audio(generation_id)
          render json: {
            status: "complete",
            duration: audio_data["duration"],
            text: audio_data["text"],
            sample_rate: audio_data["sample_rate"],
            audio_base64: audio_data["audio"]
          }
        else
          status_data = service.get_status(generation_id)
          render json: status_data || { status: "pending" }
        end
      end

      # GET /api/v1/tts/voices
      def voices
        render json: { voices: TtsService.available_voices }
      end

      # POST /api/v1/tts/batch
      def batch
        items = params[:items]

        unless items.is_a?(Array) && items.any?
          return render_error("Items array required")
        end

        batch = TtsBatch.create!(
          name: params[:name] || "API Batch #{Time.current.to_i}",
          total_items: items.size
        )

        items.each_with_index do |item, index|
          batch.tts_batch_items.create!(
            text: item[:text],
            voice_preset: item[:voice_preset],
            exaggeration: item[:exaggeration] || 0.5,
            cfg_weight: item[:cfg_weight] || 0.5,
            position: index + 1
          )
        end

        TtsBatchJob.perform_later(batch.id)

        render json: {
          batch_id: batch.id,
          status: "queued",
          total_items: batch.total_items,
          status_url: api_v1_tts_batch_status_url(batch.id)
        }, status: :accepted

      rescue ActiveRecord::RecordInvalid => e
        render_error(e.message)
      end

      # GET /api/v1/tts/batch/:id/status
      def batch_status
        batch = TtsBatch.find(params[:id])

        render json: {
          batch_id: batch.id,
          name: batch.name,
          status: batch.status,
          total_items: batch.total_items,
          completed_items: batch.completed_items,
          failed_items: batch.failed_items,
          progress_percentage: batch.progress_percentage,
          started_at: batch.started_at,
          completed_at: batch.completed_at,
          items: batch.tts_batch_items.map do |item|
            {
              id: item.id,
              position: item.position,
              status: item.status,
              text: item.text.truncate(100),
              voice_preset: item.voice_preset,
              duration: item.duration,
              error: item.error_message,
              audio_base64: item.status == "completed" ? item.audio_data : nil
            }
          end
        }
      rescue ActiveRecord::RecordNotFound
        render_error("Batch not found", status: :not_found)
      end
    end
  end
end
