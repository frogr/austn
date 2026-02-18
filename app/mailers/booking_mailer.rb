class BookingMailer < ApplicationMailer
  def confirmation(booking)
    @booking = booking
    @cancel_url = cancel_confirm_booking_url(booking.confirmation_token)
    @google_cal_url = google_calendar_url(booking)

    ical = build_ical(booking, attendee_email: booking.email, attendee_name: booking.first_name)

    mail(to: booking.email, subject: "Booking Confirmed \u2014 #{booking.formatted_date_short} at #{booking.formatted_start_time} with Austin") do |format|
      format.text
      format.html
    end.add_part(Mail::Part.new(
      content_type: "text/calendar; method=REQUEST; charset=UTF-8",
      body: ical.to_ical
    ))
  end

  def admin_notification(booking)
    @booking = booking
    @admin_booking_url = admin_booking_url(booking)
    @cancel_url = admin_booking_url(booking)

    ical = build_ical(booking, attendee_email: admin_email, attendee_name: "Austin")

    mail(to: admin_email, subject: "New Booking: #{booking.first_name} \u2014 #{booking.formatted_date_short} at #{booking.formatted_start_time}") do |format|
      format.text
      format.html
    end.add_part(Mail::Part.new(
      content_type: "text/calendar; method=REQUEST; charset=UTF-8",
      body: ical.to_ical
    ))
  end

  def cancellation(booking)
    @booking = booking
    @book_url = book_url

    ical = build_cancel_ical(booking, attendee_email: booking.email, attendee_name: booking.first_name)

    mail(to: booking.email, subject: "Booking Cancelled \u2014 #{booking.formatted_date_short} at #{booking.formatted_start_time}") do |format|
      format.text
      format.html
    end.add_part(Mail::Part.new(
      content_type: "text/calendar; method=CANCEL; charset=UTF-8",
      body: ical.to_ical
    ))
  end

  def admin_cancellation(booking)
    @booking = booking

    ical = build_cancel_ical(booking, attendee_email: admin_email, attendee_name: "Austin")

    mail(to: admin_email, subject: "Booking Cancelled: #{booking.first_name} \u2014 #{booking.formatted_date_short} at #{booking.formatted_start_time}") do |format|
      format.text
      format.html
    end.add_part(Mail::Part.new(
      content_type: "text/calendar; method=CANCEL; charset=UTF-8",
      body: ical.to_ical
    ))
  end

  private

  def admin_email
    ENV.fetch("ADMIN_EMAIL", "austindanielfrench@gmail.com")
  end

  def mailer_from
    ENV.fetch("MAILER_FROM", "bookings@austn.net")
  end

  def build_ical(booking, attendee_email:, attendee_name:)
    cal = Icalendar::Calendar.new
    cal.prodid = "-//austn.net//Booking//EN"
    cal.append_custom_property("METHOD", "REQUEST")

    cal.event do |e|
      start_dt = booking.booked_date.in_time_zone("Pacific Time (US & Canada)")
        .change(hour: booking.start_time.hour, min: booking.start_time.min)
        .utc

      end_dt = booking.booked_date.in_time_zone("Pacific Time (US & Canada)")
        .change(hour: booking.end_time.hour, min: booking.end_time.min)
        .utc

      e.dtstart = Icalendar::Values::DateTime.new(start_dt, "tzid" => "UTC")
      e.dtend = Icalendar::Values::DateTime.new(end_dt, "tzid" => "UTC")
      e.summary = "Meeting with #{booking.first_name} & Austin"
      e.description = booking.notes.present? ? booking.notes : "Booked via austn.net"
      e.uid = "#{booking.confirmation_token}@austn.net"
      e.sequence = 0
      e.status = "CONFIRMED"

      e.organizer = Icalendar::Values::CalAddress.new(
        "mailto:#{mailer_from}",
        cn: "Austin"
      )

      e.append_attendee Icalendar::Values::CalAddress.new(
        "mailto:#{attendee_email}",
        cn: attendee_name,
        partstat: "NEEDS-ACTION",
        rsvp: "TRUE"
      )
    end

    cal
  end

  def build_cancel_ical(booking, attendee_email:, attendee_name:)
    cal = Icalendar::Calendar.new
    cal.prodid = "-//austn.net//Booking//EN"
    cal.append_custom_property("METHOD", "CANCEL")

    cal.event do |e|
      start_dt = booking.booked_date.in_time_zone("Pacific Time (US & Canada)")
        .change(hour: booking.start_time.hour, min: booking.start_time.min)
        .utc

      end_dt = booking.booked_date.in_time_zone("Pacific Time (US & Canada)")
        .change(hour: booking.end_time.hour, min: booking.end_time.min)
        .utc

      e.dtstart = Icalendar::Values::DateTime.new(start_dt, "tzid" => "UTC")
      e.dtend = Icalendar::Values::DateTime.new(end_dt, "tzid" => "UTC")
      e.summary = "Meeting with #{booking.first_name} & Austin"
      e.uid = "#{booking.confirmation_token}@austn.net"
      e.sequence = 1
      e.status = "CANCELLED"

      e.organizer = Icalendar::Values::CalAddress.new(
        "mailto:#{mailer_from}",
        cn: "Austin"
      )

      e.append_attendee Icalendar::Values::CalAddress.new(
        "mailto:#{attendee_email}",
        cn: attendee_name,
        partstat: "DECLINED",
        rsvp: "FALSE"
      )
    end

    cal
  end

  def google_calendar_url(booking)
    start_dt = booking.booked_date.in_time_zone("Pacific Time (US & Canada)")
      .change(hour: booking.start_time.hour, min: booking.start_time.min)
      .utc

    end_dt = booking.booked_date.in_time_zone("Pacific Time (US & Canada)")
      .change(hour: booking.end_time.hour, min: booking.end_time.min)
      .utc

    dates = "#{start_dt.strftime('%Y%m%dT%H%M%SZ')}/#{end_dt.strftime('%Y%m%dT%H%M%SZ')}"
    details = booking.notes.present? ? booking.notes : "Booked via austn.net"

    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=#{ERB::Util.url_encode("Meeting with Austin")}&dates=#{dates}&details=#{ERB::Util.url_encode(details)}"
  end
end
