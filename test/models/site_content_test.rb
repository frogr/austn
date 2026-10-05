require "test_helper"

# Guards on the site's written content: case studies, playground pages, the
# resume and profile. Cheap checks that catch the mistakes that are easy to
# make when editing markdown by hand.
class SiteContentTest < ActiveSupport::TestCase
  CONTENT_FILES = Dir.glob(Rails.root.join("content/{work,playground}/*.md")) +
                  Dir.glob(Rails.root.join("content/*.yml")) +
                  Dir.glob(Rails.root.join("app/views/{pages,work,playground,resumes,blog,bookings}/*.erb"))

  test "every case study has the front matter the pages rely on" do
    WorkItem.all.each do |item|
      assert item.title.present?, "#{item.slug} has no title"
      assert item.summary.present?, "#{item.slug} has no summary"
      assert_includes WorkItem::TIERS, item.tier, "#{item.slug} has an unknown tier"
      assert item.timeframe.present?, "#{item.slug} has no when"
      item.links.each { |link| assert link["label"].present? && link["url"].present?, "#{item.slug} has a broken link" }
    end
  end

  test "legacy project ids point at one case study each" do
    ids = WorkItem.all.flat_map(&:legacy_ids)
    assert_equal ids.uniq, ids
  end

  test "there's at least one featured case study and one side project" do
    assert WorkItem.featured.any?
    assert WorkItem.more.any?
  end

  test "written content has no em dashes" do
    CONTENT_FILES.each do |path|
      assert_not_includes File.read(path), "—", "#{path.delete_prefix(Rails.root.to_s)} has an em dash"
    end
  end

  test "the resume has every section the page renders" do
    resume = Resume.current
    assert resume.summary.present?
    assert resume.experience.all? { |job| job["company"].present? && job["bullets"].any? }
    assert resume.skills.any?
  end
end
