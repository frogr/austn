require "test_helper"

class Admin::ClaudeCornerEntriesControllerTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    sign_in_as_admin
    @draft = ClaudeCornerEntry.create!(entry_type: "musing", title: "A Draft", content: "Body")
  end

  test "requires the admin" do
    reset!

    get admin_claude_corner_entries_path

    assert_redirected_to admin_login_path
  end

  test "lists drafts and shows one for review" do
    get admin_claude_corner_entries_path
    assert_response :success
    assert_match "A Draft", response.body

    get admin_claude_corner_entry_path(@draft)
    assert_response :success
    assert_match "Body", response.body
  end

  test "publishes and unpublishes" do
    post publish_admin_claude_corner_entry_path(@draft)
    assert @draft.reload.published?

    post unpublish_admin_claude_corner_entry_path(@draft)
    assert_not @draft.reload.published?
  end

  test "deletes" do
    assert_difference "ClaudeCornerEntry.count", -1 do
      delete admin_claude_corner_entry_path(@draft)
    end
  end

  test "asks for a draft on demand" do
    assert_enqueued_with(job: ClaudeCornerDraftJob) do
      post generate_admin_claude_corner_entries_path
    end
  end
end
