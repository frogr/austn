require "test_helper"

class AvailabilityRuleTest < ActiveSupport::TestCase
  def rule(**attributes)
    AvailabilityRule.new({ weekday: 1, start_time: "10:00", end_time: "17:00", slot_duration_minutes: 30 }.merge(attributes))
  end

  test "valid with a weekday, a window and a slot length" do
    assert rule.valid?
  end

  test "rejects bad weekdays, slot lengths and backwards windows" do
    assert rule(weekday: 7).invalid?
    assert rule(slot_duration_minutes: 20).invalid?
    assert rule(start_time: "17:00", end_time: "10:00").invalid?
  end

  test "cuts the window into slots" do
    slots = rule.slots_on(Date.new(2026, 10, 5))

    assert_equal 14, slots.size
    assert_equal "10:00", slots.first.start_label
    assert_equal "16:30", slots.last.start_label
    assert_equal "17:00", slots.last.end_label
  end

  test "keeps wall-clock times on both sides of a DST change" do
    summer = rule.slots_on(Date.new(2026, 7, 6)).first.starts_at
    winter = rule.slots_on(Date.new(2026, 12, 7)).first.starts_at

    assert_equal [ 10, 0 ], [ summer.hour, summer.min ]
    assert_equal [ 10, 0 ], [ winter.hour, winter.min ]
    assert_not_equal summer.utc_offset, winter.utc_offset
  end

  test "rule slots hold one booking and belong to no availability" do
    slot = rule.slots_on(Date.new(2026, 10, 5)).first

    assert_equal 1, slot.capacity
    assert_nil slot.availability_id
  end

  test "create_defaults! sets up weekdays 10 to 5 with 30-minute slots, once" do
    AvailabilityRule.create_defaults!
    AvailabilityRule.create_defaults!

    assert_equal (1..5).to_a, AvailabilityRule.order(:weekday).pluck(:weekday)
    first = AvailabilityRule.first
    assert_equal [ "10:00", "17:00", 30 ], [ first.start_time.strftime("%H:%M"), first.end_time.strftime("%H:%M"), first.slot_duration_minutes ]
  end
end
