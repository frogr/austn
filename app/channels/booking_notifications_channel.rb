class BookingNotificationsChannel < ApplicationCable::Channel
  def subscribed
    return reject unless admin

    stream_from "booking_notifications"
  end
end
