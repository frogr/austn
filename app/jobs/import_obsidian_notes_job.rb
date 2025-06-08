class ImportObsidianNotesJob < ApplicationJob
  queue_as :default

  OBSIDIAN_PUBLIC_PATH = ENV["OBSIDIAN_PATH"] || "/Users/austn/Library/Mobile Documents/iCloud~md~obsidian/Documents/Notes/public"

  CONTENT_BLOG_POSTS_PATH = Rails.root.join("content", "blog_posts")

  def perform
    # Ensure content directory exists
    FileUtils.mkdir_p(CONTENT_BLOG_POSTS_PATH)

    # Always process the content directory files first
    import_from_content_directory

    # In development (or if override flag is set), if Obsidian is available, also import from there
    if (Rails.env.development? || ENV["OBSIDIAN_OVERRIDE"]) && Dir.exist?(OBSIDIAN_PUBLIC_PATH)
      import_from_obsidian
    end
  end

  private

  def import_from_obsidian
    Rails.logger.info "Importing markdown files from Obsidian at #{OBSIDIAN_PUBLIC_PATH}"

    Dir.glob(File.join(OBSIDIAN_PUBLIC_PATH, "**/*.md")).each do |obsidian_file_path|
      filename = File.basename(obsidian_file_path)
      target_path = File.join(CONTENT_BLOG_POSTS_PATH, filename)

      # Skip files that already exist in the content directory
      # unless explicitly requested to override
      if File.exist?(target_path) && !ENV["OBSIDIAN_OVERRIDE"]
        Rails.logger.info "Skipping #{filename} - already exists in content directory"
        next
      end

      # Copy the file from Obsidian to content directory
      FileUtils.cp(obsidian_file_path, target_path)
      Rails.logger.info "Copied #{filename} to content directory"

      # Process the newly copied file
      process_markdown_file(target_path)
    end

    Rails.logger.info "Obsidian import complete - remember to commit new markdown files to version control"
  end

  def import_from_content_directory
    Rails.logger.info "Importing markdown files from content directory at #{CONTENT_BLOG_POSTS_PATH}"

    Dir.glob(File.join(CONTENT_BLOG_POSTS_PATH, "*.md")).each do |file_path|
      # Skip the README if it exists in this directory
      next if File.basename(file_path) == "README.md"

      process_markdown_file(file_path)
    end
  end

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
