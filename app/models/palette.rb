# The colour palettes a visitor can pick from in the footer. The colours live
# in palettes.css as .p-<slug> classes; this is the list of names.
Palette = Data.define(:slug, :name, :note, :dark) do
  def self.all
    @all ||= [
      new("pond", "Pond", "Green-black, with green doing the talking.", true),
      new("fern", "Fern", "Warm black, a little greener than it looks.", true),
      new("workbench", "Workbench", "The same warm black, led by yellow.", true),
      new("ink", "Ink", "Blue-black and a little cooler.", true),
      new("plum", "Plum", "Purple-black, led by coral.", true),
      new("paper", "Paper", "The light one.", false)
    ].freeze
  end

  def self.default = all.first

  # Anything that isn't a known slug (including a tampered cookie) is the default.
  def self.find(slug)
    all.find { |palette| palette.slug == slug.to_s } || default
  end

  def css_class = "p-#{slug}"
  def dark? = dark
end
