require "test_helper"

class LowAvailabilityAlertJobTest < ActiveJob::TestCase
  include ActionMailer::TestHelper

  setup do
    Booking.delete_all
    Availability.delete_all
    travel_to Time.zone.local(2026, 10, 5, 8, 0) # a Monday morning
  end

  test "emails the admin when fewer slots than the threshold are open" do
    AvailabilityRule.create!(weekday: 2, start_time: "10:00", end_time: "11:00", slot_duration_minutes: 30)

    assert_emails 1 do
      LowAvailabilityAlertJob.perform_now
    end

    email = ActionMailer::Base.deliveries.last
    assert_equal [ ENV.fetch("ADMIN_EMAIL", "austindanielfrench@gmail.com") ], email.to
    assert_equal "Only 4 open booking slots in the next 14 days", email.subject
    assert_match "/admin/availability_rules", email.body.to_s
  end

  test "stays quiet when there is enough open time" do
    AvailabilityRule.create_defaults!

    assert_no_emails { LowAvailabilityAlertJob.perform_now }
  end

  test "reads the threshold from ENV" do
    AvailabilityRule.create!(weekday: 2, start_time: "10:00", end_time: "11:00", slot_duration_minutes: 30)

    with_env("LOW_AVAILABILITY_THRESHOLD" => "3") do
      assert_no_emails { LowAvailabilityAlertJob.perform_now }
    end
  end

  test "sends to ADMIN_EMAIL when it is set" do
    with_env("ADMIN_EMAIL" => "austin@example.com") do
      LowAvailabilityAlertJob.perform_now
    end

    assert_equal [ "austin@example.com" ], ActionMailer::Base.deliveries.last.to
    assert_equal "Only 0 open booking slots in the next 14 days", ActionMailer::Base.deliveries.last.subject
  end
end
