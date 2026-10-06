# Who Austin is, read from content/profile.yml. Used by the layout for titles,
# meta tags and structured data so the headline lives in exactly one place.
module Profile
  PATH = Rails.root.join("content/profile.yml")

  module_function

  def data
    @data = nil unless Rails.env.production?
    @data ||= YAML.safe_load_file(PATH).freeze
  end

  def full_name = data.fetch("name")
  def headline = data.fetch("headline")
  def description = data.fetch("description")
  def email = data.fetch("email")
  def location = data.fetch("location")
  def links = data.fetch("links")

  def json_ld
    {
      "@context" => "https://schema.org",
      "@type" => "Person",
      "name" => full_name,
      "url" => "https://austn.net",
      "jobTitle" => headline,
      "email" => email,
      "address" => { "@type" => "PostalAddress", "addressLocality" => "New York", "addressRegion" => "NY" },
      "sameAs" => links.values,
      "knowsAbout" => data.fetch("knows_about")
    }
  end
end
