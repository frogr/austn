require "test_helper"

class DawPatternsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @pattern = DawPattern.create!(name: "Basic Beat", bpm: 120, data: { "tracks" => [] }, is_template: true)
  end

  test "anyone can browse and load patterns" do
    get daw_patterns_path
    assert_response :success

    get daw_pattern_path(@pattern)
    assert_response :success
  end

  test "visitors cannot create, change or delete patterns" do
    assert_no_difference "DawPattern.count" do
      post daw_patterns_path, params: { name: "Spam" }, as: :json
    end
    assert_response :unauthorized

    patch daw_pattern_path(@pattern), params: { name: "Defaced" }, as: :json
    assert_response :unauthorized

    assert_no_difference "DawPattern.count" do
      delete daw_pattern_path(@pattern), as: :json
    end
    assert_response :unauthorized
    assert_equal "Basic Beat", @pattern.reload.name
  end

  test "the admin can save patterns" do
    sign_in_as_admin

    assert_difference "DawPattern.count", 1 do
      post daw_patterns_path, params: { name: "New Loop", bpm: 90, data: { tracks: [] } }, as: :json
    end
    assert_response :created
  end

  test "pattern writes require a CSRF token" do
    sign_in_as_admin
    ActionController::Base.allow_forgery_protection = true

    post daw_patterns_path, params: { name: "New Loop" }, as: :json

    assert_response :unprocessable_entity
  ensure
    ActionController::Base.allow_forgery_protection = false
  end
end
