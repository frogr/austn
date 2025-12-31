class TtsBatchJob < GpuJob
  self.gpu_service_name = "tts"
  sidekiq_options retry: 0 # Handle retries manually per item

  def perform(batch_id)
    batch = TtsBatch.find_by(id: batch_id)
    return unless batch
    return if batch.completed?

    # Mark batch as processing if still pending
    if batch.status == "pending"
      batch.update!(status: "processing", started_at: Time.current)
      broadcast_batch_status(batch)
    end

    # Get next pending item
    item = batch.next_pending_item
    return complete_batch(batch) unless item

    # Process the item
    process_item(batch, item)

    # Queue next item if there are more
    if batch.pending_items.exists?
      TtsBatchJob.perform_later(batch_id)
    else
      complete_batch(batch)
    end
  end

  private

  def process_item(batch, item)
    item.mark_processing!
    broadcast_item_update(batch, item, "processing")

    begin
      result = TtsService.generate_speech(
        item.text,
        voice_preset: item.voice_preset,
        exaggeration: item.exaggeration,
        cfg_weight: item.cfg_weight
      )

      item.mark_completed!(audio_data: result[:audio], duration: result[:duration])
      batch.increment!(:completed_items)
      broadcast_item_update(batch, item, "completed")
      mark_service_online

    rescue => e
      Rails.logger.error "TtsBatchJob item #{item.id} failed: #{e.message}"
      item.mark_failed!(e.message)
      batch.increment!(:failed_items)
      broadcast_item_update(batch, item, "failed", e.message)
    end
  end

  def complete_batch(batch)
    status = batch.failed_items > 0 ? "completed_with_errors" : "completed"
    batch.update!(status: status, completed_at: Time.current)
    broadcast_batch_complete(batch)
  end

  def broadcast_item_update(batch, item, status, error = nil)
    ActionCable.server.broadcast(
      "tts_batch_#{batch.id}",
      {
        type: "item_update",
        item_id: item.id,
        item_position: item.position,
        status: status,
        duration: item.duration,
        error: error,
        batch_progress: batch.progress_percentage,
        completed_items: batch.reload.completed_items,
        failed_items: batch.failed_items,
        total_items: batch.total_items
      }
    )
  end

  def broadcast_batch_status(batch)
    ActionCable.server.broadcast(
      "tts_batch_#{batch.id}",
      {
        type: "batch_status",
        status: batch.status,
        started_at: batch.started_at
      }
    )
  end

  def broadcast_batch_complete(batch)
    ActionCable.server.broadcast(
      "tts_batch_#{batch.id}",
      {
        type: "batch_complete",
        status: batch.status,
        completed_items: batch.completed_items,
        failed_items: batch.failed_items,
        completed_at: batch.completed_at
      }
    )
  end
end
