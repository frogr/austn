require "test_helper"

class ClaudeCornerEntryTest < ActiveSupport::TestCase
  def entry(**attributes)
    ClaudeCornerEntry.new({ entry_type: "musing", title: "On Small Tools", content: "Short." }.merge(attributes))
  end

  test "derives a unique slug from the title" do
    first = entry.tap(&:save!)
    second = entry.tap(&:save!)

    assert_equal "on-small-tools", first.slug
    assert_match(/\Aon-small-tools-\h{6}\z/, second.slug)
  end

  test "only accepts known entry types" do
    assert entry(entry_type: "rant").invalid?
  end

  test "starts as a draft and can be published and unpublished" do
    record = entry.tap(&:save!)
    assert_not record.published?
    assert_includes ClaudeCornerEntry.drafts, record

    record.publish!
    assert_includes ClaudeCornerEntry.published, record

    record.unpublish!
    assert_not record.reload.published?
  end

  test "renders as the props the page expects" do
    record = entry(tags: [ "tools" ], mood: "curious").tap(&:save!)
    record.publish!

    props = record.as_props

    assert_equal %i[id type title content tags mood created_at], props.keys
    assert_equal "on-small-tools", props[:id]
    assert_equal "musing", props[:type]
    assert_equal record.published_at.iso8601, props[:created_at]
  end
end
