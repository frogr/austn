module Api
  module V1
    class TtsController < BaseController
      # POST /api/v1/tts/generate (async - returns generation ID)
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

      # POST /api/v1/tts/synthesize (sync - returns audio file directly)
      # This is the simple endpoint for remote TTS from laptop
      # Accepts: { text: "...", voice: "optional_voice_name" }
      # Returns: WAV audio file
      def synthesize
        text = params[:text]
        unless text.present?
          return render_error("Text is required")
        end

        # Log the request for debugging
        request_id = SecureRandom.hex(8)
        Rails.logger.info "[TTS API #{request_id}] Synthesize request: text=#{text.truncate(100)}, voice=#{params[:voice]}"

        # Build options
        options = {
          exaggeration: (params[:exaggeration] || 0.5).to_f,
          cfg_weight: (params[:cfg_weight] || 0.5).to_f
        }

        # Handle voice parameter (alias for voice_preset)
        voice = params[:voice] || params[:voice_preset]
        if voice.present?
          options[:voice_preset] = TtsService.normalize_voice_preset(voice)
          Rails.logger.info "[TTS API #{request_id}] Using voice: #{options[:voice_preset]}"
        end

        # Call TTS service synchronously
        start_time = Time.current
        result = TtsService.generate_speech(text, options)
        elapsed = Time.current - start_time

        Rails.logger.info "[TTS API #{request_id}] Generated #{result[:duration]}s audio in #{elapsed.round(2)}s"

        # Decode and send the audio file
        audio_binary = Base64.decode64(result[:audio])

        # Set response headers for rate limit info
        response.headers["X-TTS-Duration"] = result[:duration].to_s
        response.headers["X-TTS-Sample-Rate"] = result[:sample_rate].to_s
        response.headers["X-TTS-Request-ID"] = request_id

        send_data audio_binary,
                  type: "audio/wav",
                  disposition: params[:download] == "true" ? "attachment" : "inline",
                  filename: "tts-#{request_id}.wav"

      rescue TtsService::TtsError => e
        Rails.logger.error "[TTS API #{request_id}] TTS error: #{e.message}"
        render_error(e.message, status: :service_unavailable)
      rescue => e
        Rails.logger.error "[TTS API #{request_id}] Unexpected error: #{e.class} - #{e.message}"
        Rails.logger.error e.backtrace.first(5).join("\n")
        render_error("Internal server error", status: :internal_server_error)
      end

      # GET /api/v1/tts/health - Check if TTS service is available
      def health
        health_status = TtsService.health_check

        if health_status[:status] == "ok" || health_status["status"] == "ok"
          render json: {
            status: "ok",
            service: "chatterbox",
            timestamp: Time.current.iso8601
          }
        else
          render json: {
            status: "unavailable",
            error: health_status[:error] || health_status["error"] || "Service unreachable",
            timestamp: Time.current.iso8601
          }, status: :service_unavailable
        end
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
