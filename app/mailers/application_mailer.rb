class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM", "bookings@austn.net")
  layout "mailer"
end
