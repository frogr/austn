require "test_helper"

class OfferTest < ActiveSupport::TestCase
  test "every offer in content/offers.yml has a title, a summary, a timeline and no price" do
    assert Offer.all.any?
    Offer.all.each do |offer|
      assert offer.title.present? && offer.summary.present?, "#{offer.slug} is missing a title or summary"
      assert offer.timeline.present?, "#{offer.slug} has no timeline"
      assert_nil offer.attributes["price"], "#{offer.slug} has a price; prices live on the marketplace profiles"
      offer.tiers.each do |tier|
        assert tier["name"].present? && tier["days"].is_a?(Integer), "#{offer.slug} has a broken tier"
        assert_nil tier["price"], "#{offer.slug}'s #{tier["name"]} tier has a price"
      end
    end
    assert_equal Offer.all.map(&:slug).uniq, Offer.all.map(&:slug)
  end

  test "every offer's examples point at side projects that exist" do
    Offer.all.each do |offer|
      assert Array(offer.attributes["examples"]).any?, "#{offer.slug} has no examples"
      Array(offer.attributes["examples"]).each do |slug|
        assert WorkItem.find_by_slug(slug), "#{offer.slug} lists #{slug} as an example, which isn't in content/work"
      end
      Course.find(offer.course_slug) if offer.course_slug
    end
  end

  test "the MCP server tiers and the sprint have their timelines" do
    mcp = Offer.all.find { |offer| offer.slug == "mcp-server" }
    assert_equal [ [ "Basic", 3 ], [ "Standard", 5 ], [ "Premium", 7 ] ], mcp.tiers.map { |tier| tier.values_at("name", "days") }
    assert_equal "3 to 7 days", mcp.timeline
    assert_equal "One week", Offer.all.find { |offer| offer.slug == "eval-sprint" }.timeline
  end

  test "only https marketplace profiles are shown" do
    Offer.stub(:data, Offer.data.merge("profiles" => [ { "label" => "Fiverr", "url" => "https://fiverr.com/x" }, { "label" => "Bad", "url" => "javascript:alert(1)" } ])) do
      assert_equal [ "Fiverr" ], Offer.profiles.map { |profile| profile["label"] }
    end
  end
end
