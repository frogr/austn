# Notes to Austin about the site itself.
class AdminMailer < ApplicationMailer
  def low_availability(open_slots:, threshold:, days:)
    @open_slots = open_slots
    @threshold = threshold
    @days = days
    @rules_url = admin_availability_rules_url
    @availabilities_url = admin_availabilities_url

    mail(to: admin_email, subject: "Only #{open_slots} open booking #{'slot'.pluralize(open_slots)} in the next #{days} days")
  end
end
