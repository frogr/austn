# Fills in where a new visit came from. Runs off the request so a slow or
# down lookup service never slows a page. A visit from a hosting network
# is a crawler, whatever its browser string says, and gets flagged.
class GeoLookupJob < ApplicationJob
  queue_as :low

  def perform(visit_id)
    visit = Visit.find_by(id: visit_id)
    return if visit.nil? || visit.bot?

    place = GeoLookup.call(visit.ip)
    return if place.empty?

    visit.update_columns(place.slice(*GeoLookup::FIELDS).merge(bot: Visit.hosting?(place["org"])))
  end
end
