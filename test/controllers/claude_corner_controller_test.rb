require "test_helper"

class ClaudeCornerControllerTest < ActionDispatch::IntegrationTest
  test "renders published entries from the database and hides drafts" do
    ClaudeCornerEntry.create!(entry_type: "musing", title: "Published Thought", content: "Hi", published_at: 1.day.ago)
    ClaudeCornerEntry.create!(entry_type: "musing", title: "Unreviewed Draft", content: "Hi")

    get "/claude"

    assert_response :success
    props = JSON.parse(css_select("[data-react-component='ClaudeCorner']").first["data-props"])
    assert_equal [ "Published Thought" ], props["entries"].map { |entry| entry["title"] }
  end
end
