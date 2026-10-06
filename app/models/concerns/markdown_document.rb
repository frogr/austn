# Shared loading for content that lives as markdown files with YAML front matter
# (case studies in content/work, playground pages in content/playground).
module MarkdownDocument
  extend ActiveSupport::Concern

  included do
    attr_reader :slug, :attributes, :body
  end

  class_methods do
    def content_dir
      raise NotImplementedError
    end

    def all
      @all = nil unless Rails.env.production?
      @all ||= Dir.glob(content_dir.join("*.md")).map { |path| from_file(path) }.sort_by(&:sort_key).freeze
    end

    def find(slug)
      all.find { |doc| doc.slug == slug.to_s } || raise(ActiveRecord::RecordNotFound, "No #{name} named #{slug}")
    end

    def find_by_slug(slug)
      all.find { |doc| doc.slug == slug.to_s }
    end

    def from_file(path)
      parsed = FrontMatterParser::Parser.parse_file(path, loader: FrontMatterParser::Loader::Yaml.new(allowlist_classes: [ Date ]))
      new(slug: File.basename(path, ".md"), attributes: parsed.front_matter, body: parsed.content)
    end
  end

  def initialize(slug:, attributes:, body:)
    @slug = slug
    @attributes = attributes.freeze
    @body = body
  end

  def title = attributes.fetch("title")
  def summary = attributes["summary"]
  def order = attributes.fetch("order", 999)
  def sort_key = [ order, title ]
  def to_param = slug
end
