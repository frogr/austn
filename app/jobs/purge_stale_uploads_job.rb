# GPU jobs purge their uploaded input when they finish or give up. This
# catches the rest, such as uploads whose job was lost before it ran.
class PurgeStaleUploadsJob < ApplicationJob
  queue_as :low

  def perform(older_than: 1.day)
    ActiveStorage::Blob.unattached.where(created_at: ...older_than.ago).find_each(&:purge_later)
  end
end
