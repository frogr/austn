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

  # Twice a week: who came, what they did, where they stopped. See VisitDigest.
  def visit_digest(digest)
    @digest = digest
    @analytics_url = admin_analytics_url
    @visit_url = ->(visit) { admin_analytics_visit_url(visit) }

    mail(to: admin_email, subject: "#{digest.visitors} visitors, #{digest.readers} readers, #{digest.bookings} #{'booking'.pluralize(digest.bookings)} since #{digest.since.in_time_zone.strftime('%A')}") do |format|
      format.text
      format.html
    end
  end
end
