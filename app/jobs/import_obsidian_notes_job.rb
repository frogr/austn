class ImportObsidianNotesJob < ApplicationJob
  queue_as :default

  OBSIDIAN_PUBLIC_PATH = ENV["OBSIDIAN_PATH"] || "/Users/austn/Library/Mobile Documents/iCloud~md~obsidian/Documents/Notes/public"
  OBSIDIAN_VAULT_ROOT = ENV["OBSIDIAN_VAULT_ROOT"] || "/Users/austn/Library/Mobile Documents/iCloud~md~obsidian/Documents/Notes"

  CONTENT_BLOG_POSTS_PATH = Rails.root.join("content", "blog_posts")

  # Regex patterns for image references in markdown
  # Wiki-style: ![[image.png]] or ![[folder/image.png]]
  WIKI_IMAGE_PATTERN = /!\[\[([^\]]+\.(?:png|jpe?g|gif|webp|svg|avif))\]\]/i
  # Standard markdown: ![alt](path/to/image.png) - but not http(s) URLs
  MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+\.(?:png|jpe?g|gif|webp|svg|avif))\)/i

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

      # Read the original file content for image processing
      original_content = File.read(obsidian_file_path)

      # Process images first (while we still have access to the Obsidian vault paths)
      if R2ImageService.configured?
        processed_content = process_images(original_content, File.dirname(obsidian_file_path), obsidian_file_path)
        File.write(target_path, processed_content)
        Rails.logger.info "Copied #{filename} to content directory (with CDN images)"
      else
        FileUtils.cp(obsidian_file_path, target_path)
        Rails.logger.info "Copied #{filename} to content directory"
      end

      # Process the newly copied file (now with CDN URLs if R2 was configured)
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

  def process_images(content, source_dir, markdown_file_path)
    processed_content = content.dup

    # Process wiki-style image links: ![[image.png]]
    processed_content.gsub!(WIKI_IMAGE_PATTERN) do |match|
      image_ref = $1
      process_single_image(image_ref, source_dir, markdown_file_path, match) do |cdn_url, alt_text|
        "![#{alt_text}](#{cdn_url})"
      end
    end

    # Process standard markdown images: ![alt](path)
    processed_content.gsub!(MARKDOWN_IMAGE_PATTERN) do |match|
      alt_text = $1
      image_ref = $2
      process_single_image(image_ref, source_dir, markdown_file_path, match, alt_text) do |cdn_url, final_alt|
        "![#{final_alt}](#{cdn_url})"
      end
    end

    processed_content
  end

  def process_single_image(image_ref, source_dir, markdown_file_path, original_match, alt_text = nil)
    # Try to find the image file
    image_path = find_image_file(image_ref, source_dir, markdown_file_path)

    unless image_path
      Rails.logger.warn "Image not found: #{image_ref}"
      return original_match
    end

    begin
      cdn_url = R2ImageService.upload_file(image_path)
      final_alt = alt_text.presence || File.basename(image_ref, ".*").titleize
      yield(cdn_url, final_alt)
    rescue R2ImageService::R2Error => e
      Rails.logger.error "Failed to upload image #{image_ref}: #{e.message}"
      original_match
    end
  end

  def find_image_file(image_ref, source_dir, markdown_file_path)
    # Clean up the reference (remove any leading ./)
    clean_ref = image_ref.sub(%r{^\./}, "")

    # Search locations in order of priority:
    search_paths = [
      # 1. Relative to the markdown file's directory
      File.join(File.dirname(markdown_file_path), clean_ref),
      # 2. In an "attachments" folder relative to the markdown file
      File.join(File.dirname(markdown_file_path), "attachments", File.basename(clean_ref)),
      # 3. Relative to the source directory (e.g., public folder)
      File.join(source_dir, clean_ref),
      # 4. In an "attachments" folder in the source directory
      File.join(source_dir, "attachments", File.basename(clean_ref)),
      # 5. In the vault root's attachments folder
      File.join(OBSIDIAN_VAULT_ROOT, "attachments", File.basename(clean_ref)),
      # 6. Search the entire vault for the file by name (Obsidian's default behavior)
      find_in_vault(File.basename(clean_ref))
    ].compact

    search_paths.find { |path| path && File.exist?(path) }
  end

  def find_in_vault(filename)
    # Search the entire Obsidian vault for a file with this name
    return nil unless Dir.exist?(OBSIDIAN_VAULT_ROOT)

    Dir.glob(File.join(OBSIDIAN_VAULT_ROOT, "**", filename)).first
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
