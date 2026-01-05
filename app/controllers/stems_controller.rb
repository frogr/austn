class StemsController < ApplicationController
  include GpuQueueStatus

  skip_before_action :verify_authenticity_token, only: [:generate]

  def index
    # Show the stems form
  end

  def generate
    unless params[:audio].present?
      render json: { success: false, error: "No audio file provided" }, status: :bad_request
      return
    end

    generation_id = SecureRandom.uuid

    Rails.logger.info "Starting stems generation #{generation_id}"

    # Read and encode the uploaded file
    uploaded_file = params[:audio]
    file_data = {
      "base64" => Base64.strict_encode64(uploaded_file.read)
    }
    uploaded_file.rewind

    # Queue the job
    StemsJob.perform_later(
      generation_id,
      file_data,
      {
        "original_filename" => uploaded_file.original_filename,
        "model" => params[:model] || StemSeparationService::DEFAULT_MODEL
      }
    )

    render json: {
      success: true,
      generation_id: generation_id,
      status: "queued",
      check_url: status_stems_path(generation_id),
      websocket_channel: "stems_#{generation_id}"
    }
  rescue => e
    Rails.logger.error "Failed to queue stems generation: #{e.message}"
    render json: { success: false, error: e.message }, status: :internal_server_error
  end

  def status
    generation_id = params[:id]

    # Check if result is ready
    if redis_service.result_exists?(generation_id)
      result_data = redis_service.get_result(generation_id)
      stems_available = result_data&.dig("stems")&.keys || []

      render json: {
        status: "complete",
        stems: stems_available,
        result_url: result_stems_path(generation_id)
      }
    else
      render json: status_with_queue_position(generation_id, redis_service)
    end
  end

  def result
    generation_id = params[:id]
    result_data = redis_service.get_result(generation_id)

    if result_data
      # Don't send the full base64 data, just metadata
      response = {
        original_filename: result_data["original_filename"],
        model: result_data["model"],
        created_at: result_data["created_at"],
        stems: result_data["stems"]&.keys || []
      }
      render json: response
    else
      render json: { error: "Result not found or expired" }, status: :not_found
    end
  end

  def download_stem
    generation_id = params[:id]
    stem_name = params[:stem]

    unless StemSeparationService::STEM_NAMES.include?(stem_name)
      render json: { error: "Invalid stem name" }, status: :bad_request
      return
    end

    result_data = redis_service.get_result(generation_id)

    if result_data && result_data["stems"]&.key?(stem_name)
      # Generate filename based on original and stem name
      original = result_data["original_filename"] || "audio.mp3"
      basename = File.basename(original, ".*")
      filename = "#{basename}_#{stem_name}.wav"

      send_data Base64.decode64(result_data["stems"][stem_name]),
                type: "audio/wav",
                disposition: "attachment",
                filename: filename
    else
      render json: { error: "Stem not found or expired" }, status: :not_found
    end
  end

  def download_all
    generation_id = params[:id]
    result_data = redis_service.get_result(generation_id)

    if result_data && result_data["stems"]
      # Create a zip file with all stems
      original = result_data["original_filename"] || "audio.mp3"
      basename = File.basename(original, ".*")

      require "zip"

      zip_data = Zip::OutputStream.write_buffer do |zip|
        result_data["stems"].each do |stem_name, stem_base64|
          zip.put_next_entry("#{basename}_#{stem_name}.wav")
          zip.write(Base64.decode64(stem_base64))
        end
      end

      send_data zip_data.string,
                type: "application/zip",
                disposition: "attachment",
                filename: "#{basename}_stems.zip"
    else
      render json: { error: "Result not found or expired" }, status: :not_found
    end
  end

  def models
    render json: {
      models: StemSeparationService::AVAILABLE_MODELS,
      default: StemSeparationService::DEFAULT_MODEL,
      stems: StemSeparationService::STEM_NAMES
    }
  end

  private

  def redis_service
    @redis_service ||= StemsRedisService.new
  end
end
