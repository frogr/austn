class BookingNotificationsChannel < ApplicationCable::Channel
  def subscribed
    stream_from "booking_notifications"
  end

  def unsubscribed
  end
end
