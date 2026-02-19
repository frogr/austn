class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM", "hi@austn.net")
  layout "mailer"
end
