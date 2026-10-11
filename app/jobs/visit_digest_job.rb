# Mails Austin the visit digest. Scheduled Monday and Thursday mornings,
# and sent on demand from the analytics page.
class VisitDigestJob < ApplicationJob
  queue_as :default

  def perform
    AdminMailer.visit_digest(VisitDigest.new).deliver_now
  end
end
