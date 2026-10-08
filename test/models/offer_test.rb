require "test_helper"

class OfferTest < ActiveSupport::TestCase
  test "every offer in content/offers.yml has a title, a summary and a price or tiers" do
    assert Offer.all.any?
    Offer.all.each do |offer|
      assert offer.title.present?, "#{offer.slug} has no title"
      assert offer.summary.present?, "#{offer.slug} has no summary"
      offer.tiers.each do |tier|
        assert tier["name"].present? && tier["price"].is_a?(Integer) && tier["days"].is_a?(Integer), "#{offer.slug} has a broken tier"
      end
    end
    assert_equal Offer.all.map(&:slug).uniq, Offer.all.map(&:slug)
  end

  test "every offer's proof points at a case study that exists" do
    Offer.all.each do |offer|
      assert Array(offer.attributes["proof"]).any?, "#{offer.slug} has no proof"
      Array(offer.attributes["proof"]).each do |slug|
        assert WorkItem.find_by_slug(slug), "#{offer.slug} lists #{slug} as proof, which isn't in content/work"
      end
      Course.find(offer.course_slug) if offer.course_slug
    end
  end

  test "the MCP server tiers and the eval sprint have their fixed prices" do
    mcp = Offer.all.find { |offer| offer.slug == "mcp-server" }
    assert_equal [ [ "Basic", 150, 3 ], [ "Standard", 350, 5 ], [ "Premium", 750, 7 ] ],
                 mcp.tiers.map { |tier| tier.values_at("name", "price", "days") }

    sprint = Offer.all.find { |offer| offer.slug == "eval-sprint" }
    assert_equal "$750", sprint.price_label
  end

  test "a starting price shows as from $X, and no price at all says it's scoped per project" do
    assert_equal "from $1,500", Offer.new("from_price" => 1500).price_label
    assert_equal "Scoped per project", Offer.new("from_price" => nil).price_label
    assert_equal "$750", Offer.new("price" => 750, "from_price" => 100).price_label
  end
end
