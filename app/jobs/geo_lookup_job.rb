# Fills in where a new visit came from. Runs off the request so a slow or
# down lookup service never slows a page.
class GeoLookupJob < ApplicationJob
  queue_as :low

  def perform(visit_id)
    visit = Visit.find_by(id: visit_id)
    return unless visit

    place = GeoLookup.call(visit.ip)
    visit.update_columns(place.slice(*GeoLookup::FIELDS)) if place.any?
  end
end
