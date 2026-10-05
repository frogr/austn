# The resume, read from content/resume.yml. Renders the /resume page and the PDF.
class Resume
  PATH = Rails.root.join("content/resume.yml")

  def self.current
    @current = nil unless Rails.env.production?
    @current ||= new(YAML.safe_load_file(PATH))
  end

  attr_reader :data

  def initialize(data)
    @data = data.freeze
  end

  %w[title location email links summary experience projects skills].each do |key|
    define_method(key) { data.fetch(key) }
  end
end
