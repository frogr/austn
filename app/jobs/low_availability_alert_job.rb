# Emails Austin when few booking slots are open over the next two weeks, so
# /book doesn't quietly run dry. Runs daily; the threshold comes from
# LOW_AVAILABILITY_THRESHOLD.
class LowAvailabilityAlertJob < ApplicationJob
  queue_as :default

  LOOKAHEAD_DAYS = 14
  DEFAULT_THRESHOLD = 5

  def perform
    today = Date.current
    open_slots = BookingSchedule.new.open_slots(today..(today + LOOKAHEAD_DAYS - 1)).size
    return if open_slots >= threshold

    AdminMailer.low_availability(open_slots: open_slots, threshold: threshold, days: LOOKAHEAD_DAYS).deliver_now
  end

  private

  def threshold
    Integer(ENV.fetch("LOW_AVAILABILITY_THRESHOLD", DEFAULT_THRESHOLD))
  end
end
