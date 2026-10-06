require "test_helper"

class Admin::AvailabilityRulesControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in_as_admin
    @rule = AvailabilityRule.create!(weekday: 1, start_time: "10:00", end_time: "17:00", slot_duration_minutes: 30)
  end

  test "requires the admin" do
    reset!

    get admin_availability_rules_path

    assert_redirected_to admin_login_path
  end

  test "lists rules" do
    get admin_availability_rules_path

    assert_response :success
    assert_match "Monday", response.body
    assert_match "10:00 AM to 5:00 PM", response.body
  end

  test "creates a rule" do
    assert_difference "AvailabilityRule.count", 1 do
      post admin_availability_rules_path, params: { availability_rule: {
        weekday: 6, start_time: "09:00", end_time: "12:00", slot_duration_minutes: 60, active: "1"
      } }
    end

    assert_redirected_to admin_availability_rules_path
    assert_equal "09:00", AvailabilityRule.last.start_time.strftime("%H:%M")
  end

  test "rejects an invalid rule" do
    post admin_availability_rules_path, params: { availability_rule: { weekday: 2, start_time: "12:00", end_time: "09:00" } }

    assert_response :unprocessable_entity
  end

  test "pauses a rule" do
    get edit_admin_availability_rule_path(@rule)
    assert_response :success

    patch admin_availability_rule_path(@rule), params: { availability_rule: { active: "0" } }

    assert_redirected_to admin_availability_rules_path
    assert_not @rule.reload.active?
  end

  test "deletes a rule" do
    assert_difference "AvailabilityRule.count", -1 do
      delete admin_availability_rule_path(@rule)
    end
  end
end
