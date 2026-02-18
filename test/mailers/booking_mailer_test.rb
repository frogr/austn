require "test_helper"

class BookingMailerTest < ActionMailer::TestCase
  test "confirmation email" do
    booking = bookings(:confirmed_booking)
    email = BookingMailer.confirmation(booking)

    assert_equal ["jane@example.com"], email.to
    assert_match "Booking Confirmed", email.subject
    assert_match booking.formatted_date_short, email.subject

    # Check HTML body
    html_body = email.html_part.body.to_s
    assert_match "You're booked!", html_body
    assert_match "Jane", html_body

    # Check text body
    text_body = email.text_part.body.to_s
    assert_match "You're booked!", text_body
    assert_match "Jane", text_body

    # Check ICS calendar part exists
    calendar_part = email.parts.find { |p| p.content_type.include?("text/calendar") }
    assert calendar_part, "Email should contain a text/calendar part"
    assert_match "METHOD:REQUEST", calendar_part.body.to_s
    assert_match "CONFIRMED", calendar_part.body.to_s
    assert_match booking.confirmation_token, calendar_part.body.to_s
  end

  test "admin notification email" do
    booking = bookings(:confirmed_booking)
    email = BookingMailer.admin_notification(booking)

    admin_email = ENV.fetch("ADMIN_EMAIL", "austindanielfrench@gmail.com")
    assert_equal [admin_email], email.to
    assert_match "New Booking: Jane", email.subject

    html_body = email.html_part.body.to_s
    assert_match "jane@example.com", html_body
    assert_match "5551234567", html_body

    # Check ICS calendar part
    calendar_part = email.parts.find { |p| p.content_type.include?("text/calendar") }
    assert calendar_part, "Admin email should contain a text/calendar part"
    assert_match "METHOD:REQUEST", calendar_part.body.to_s
  end

  test "cancellation email" do
    booking = bookings(:confirmed_booking)
    email = BookingMailer.cancellation(booking)

    assert_equal ["jane@example.com"], email.to
    assert_match "Booking Cancelled", email.subject

    html_body = email.html_part.body.to_s
    assert_match "cancelled", html_body.downcase

    # Check ICS cancel part
    calendar_part = email.parts.find { |p| p.content_type.include?("text/calendar") }
    assert calendar_part, "Cancellation email should contain a text/calendar part"
    assert_match "METHOD:CANCEL", calendar_part.body.to_s
    assert_match "CANCELLED", calendar_part.body.to_s
  end

  test "admin cancellation email" do
    booking = bookings(:confirmed_booking)
    email = BookingMailer.admin_cancellation(booking)

    admin_email = ENV.fetch("ADMIN_EMAIL", "austindanielfrench@gmail.com")
    assert_equal [admin_email], email.to
    assert_match "Booking Cancelled: Jane", email.subject

    # Check ICS cancel part
    calendar_part = email.parts.find { |p| p.content_type.include?("text/calendar") }
    assert calendar_part
    assert_match "METHOD:CANCEL", calendar_part.body.to_s
  end

  test "ics contains correct UID from confirmation_token" do
    booking = bookings(:confirmed_booking)
    email = BookingMailer.confirmation(booking)

    calendar_part = email.parts.find { |p| p.content_type.include?("text/calendar") }
    assert_match "#{booking.confirmation_token}@austn.net", calendar_part.body.to_s
  end

  test "ics organizer matches mailer from address" do
    booking = bookings(:confirmed_booking)
    email = BookingMailer.confirmation(booking)

    from_address = ENV.fetch("MAILER_FROM", "bookings@austn.net")
    calendar_part = email.parts.find { |p| p.content_type.include?("text/calendar") }
    assert_match from_address, calendar_part.body.to_s
  end
end
