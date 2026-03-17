class TtsBatchesController < ApplicationController
  include AdminAuthenticatable

  before_action :authenticate_admin!
  skip_before_action :verify_authenticity_token, only: [ :create, :share_item ]

  def index
    @batches = TtsBatch.recent.limit(50)
  end

  def show
    @batch = TtsBatch.find(params[:id])
    @voices = TtsService.available_voices
  end

  def new
    @voices = TtsService.available_voices
  end

  def create
    csv_file = params[:csv_file]

    unless csv_file.present?
      return render json: { error: "CSV file required" }, status: :unprocessable_entity
    end

    batch = TtsBatch.new(name: params[:name].presence || "Batch #{Time.current.strftime('%Y-%m-%d %H:%M')}")
    items_data = parse_csv(csv_file)

    if items_data.empty?
      return render json: { error: "No valid items in CSV" }, status: :unprocessable_entity
    end

    ActiveRecord::Base.transaction do
      batch.total_items = items_data.size
      batch.save!

      items_data.each_with_index do |row, index|
        batch.tts_batch_items.create!(
          text: row[:text],
          voice_preset: row[:voice_preset],
          exaggeration: row[:exaggeration] || 0.5,
          cfg_weight: row[:cfg_weight] || 0.5,
          position: index + 1
        )
      end
    end

    TtsBatchJob.perform_later(batch.id)

    render json: {
      batch_id: batch.id,
      total_items: batch.total_items,
      redirect_url: tts_batch_path(batch)
    }
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def download_item
    item = TtsBatchItem.find(params[:id])

    if item.audio_data.present?
      send_data Base64.decode64(item.audio_data),
                type: "audio/wav",
                disposition: "attachment",
                filename: "batch-#{item.tts_batch_id}-item-#{item.position}.wav"
    else
      head :not_found
    end
  end

  def share_item
    item = TtsBatchItem.find(params[:id])

    if item.audio_data.present?
      share = TtsShare.create!(
        audio_data: item.audio_data,
        text: item.text,
        duration: item.duration,
        voice_preset: item.voice_preset
      )

      render json: {
        share_url: tts_share_url(share.token),
        token: share.token,
        expires_at: share.expires_at
      }
    else
      render json: { error: "Audio not found" }, status: :not_found
    end
  rescue => e
    render json: { error: e.message }, status: :internal_server_error
  end

  def download_all
    batch = TtsBatch.find(params[:id])
    completed_items = batch.tts_batch_items.completed

    if completed_items.empty?
      redirect_to tts_batch_path(batch), alert: "No completed items to download"
      return
    end

    # Stream zip to avoid loading all audio data into memory at once
    require "zip"

    zip_filename = "batch-#{batch.id}-#{batch.name.parameterize}.zip"
    response.headers["Content-Type"] = "application/zip"
    response.headers["Content-Disposition"] = "attachment; filename=\"#{zip_filename}\""

    # Use a streaming approach: write zip to a temp file, then stream it
    temp_zip = Tempfile.new([ "tts_batch", ".zip" ])
    begin
      Zip::OutputStream.open(temp_zip.path) do |zip|
        completed_items.find_each do |item|
          filename = "#{item.position.to_s.rjust(3, '0')}-#{item.voice_preset || 'default'}.wav"
          zip.put_next_entry(filename)
          zip.write(Base64.decode64(item.audio_data))
        end
      end

      send_file temp_zip.path,
                type: "application/zip",
                disposition: "attachment",
                filename: zip_filename
    ensure
      temp_zip.close
    end
  end

  private

  def parse_csv(file)
    require "csv"
    items = []
    CSV.foreach(file.path, headers: true) do |row|
      next if row["text"].blank?
      items << {
        text: row["text"],
        voice_preset: row["voice_preset"].presence,
        exaggeration: row["exaggeration"]&.to_f,
        cfg_weight: row["cfg_weight"]&.to_f
      }
    end
    items
  end
end
