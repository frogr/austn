require "test_helper"

class PalettesControllerTest < ActionDispatch::IntegrationTest
  test "the site starts in the default palette" do
    get root_path

    assert_select "html.#{Palette.default.css_class}"
  end

  test "picking a palette is remembered on the next page" do
    post palette_path, params: { name: "pond" }
    assert_redirected_to root_path

    get work_index_path
    assert_select "html.p-pond"
  end

  test "picking a palette sends you back to the page you were on" do
    post palette_path, params: { name: "ink" }, headers: { "HTTP_REFERER" => playground_url }

    assert_redirected_to playground_url
  end

  test "an unknown palette, or a tampered cookie, falls back to the default" do
    post palette_path, params: { name: "<script>" }
    get root_path
    assert_select "html.#{Palette.default.css_class}"

    cookies[:palette] = "nope"
    get root_path
    assert_select "html.#{Palette.default.css_class}"
  end

  test "the comparison page shows every palette with a button to use it" do
    get palettes_path

    assert_response :success
    Palette.all.each do |palette|
      assert_select ".palette-card.#{palette.css_class} h2", palette.name
      assert_select ".palette-card.#{palette.css_class} form[action=?]", palette_path
    end
  end

  test "every palette in the list has its colours defined" do
    css = Rails.root.join("app/assets/stylesheets/palettes.css").read

    Palette.all.each { |palette| assert_includes css, ".#{palette.css_class} {", "#{palette.name} has no colours in palettes.css" }
  end

  test "the tool pages keep a dark palette when the light one is picked" do
    post palette_path, params: { name: "paper" }

    get "/pitch"
    assert_select "html.#{Palette.default.css_class}"
  end
end
