class BriefingMailer < ApplicationMailer
  def digest(recipient:, subject:, sections:)
    @sections = sections
    @subject = subject

    mail(to: recipient, subject: subject)
  end
end
