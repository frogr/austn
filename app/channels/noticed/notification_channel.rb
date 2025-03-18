module Noticed
  class NotificationChannel < ApplicationCable::Channel
    def subscribed
      # This is a stub channel to prevent errors
      # The actual Noticed gem is not installed, but something is trying to subscribe to this channel
      reject
    end
  end
end
