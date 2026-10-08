# Visits older than a year go, events included. A year of history is
# plenty for seeing what a page did; keeping IPs longer than that is not.
class PurgeOldVisitsJob < ApplicationJob
  queue_as :low

  def perform
    Visit.purge_old!
  end
end
