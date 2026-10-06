class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM", "hi@austn.net")
  layout "mailer"

  private

  # Where notifications for Austin go.
  def admin_email
    ENV.fetch("ADMIN_EMAIL", "austindanielfrench@gmail.com")
  end
end
