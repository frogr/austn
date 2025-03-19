class ImportObsidianNotesJob < ApplicationJob
  queue_as :default

  OBSIDIAN_PUBLIC_PATH = File.join(
    ENV["OBSIDIAN_PATH"] || File.join(Dir.home, "Library/Mobile Documents/iCloud~md~obsidian/Documents/Notes/public")
  )

  def perform
    unless Dir.exist?(OBSIDIAN_PUBLIC_PATH)
      Rails.logger.warn "Obsidian public directory not found at #{OBSIDIAN_PUBLIC_PATH}"
      return
    end

    Rails.logger.info "Importing markdown files from #{OBSIDIAN_PUBLIC_PATH}"

    Dir.glob(File.join(OBSIDIAN_PUBLIC_PATH, "**/*.md")).each do |file_path|
      process_markdown_file(file_path)
    end
  end

  private

  def process_markdown_file(file_path)
    content = File.read(file_path)
    filename = File.basename(file_path, ".md")

    # Extract frontmatter and content
    frontmatter, markdown_content = extract_frontmatter(content)

    # Skip if the post has a "draft: true" in frontmatter
    return if frontmatter["draft"] == true

    title = frontmatter["title"] || filename.titleize
    slug = frontmatter["slug"] || filename.parameterize

    blog_post = BlogPost.find_or_initialize_by(slug: slug)
    blog_post.assign_attributes(
      title: title,
      content: markdown_content,
      published_at: frontmatter["date"],
      metadata: frontmatter
    )

    if blog_post.save
      Rails.logger.info "Imported: #{title}"
    else
      Rails.logger.error "Failed to import #{file_path}: #{blog_post.errors.full_messages.join(', ')}"
    end
  end

  def extract_frontmatter(content)
    frontmatter = {}
    markdown_content = content

    # Check for YAML frontmatter (between --- markers)
    if content.start_with?("---")
      parts = content.split("---", 3)
      if parts.length >= 3
        begin
          frontmatter = YAML.safe_load(parts[1])
          markdown_content = parts[2..-1].join("---")
        rescue => e
          Rails.logger.error "Error parsing frontmatter: #{e.message}"
        end
      end
    end

    [ frontmatter, markdown_content ]
  end
end
