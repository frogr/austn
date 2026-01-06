namespace :blog_posts do
  desc "Import blog posts from content directory and Obsidian (if available)"
  task import: :environment do
    ImportObsidianNotesJob.perform_now
  end

  desc "Import blog posts from content directory only (skip Obsidian)"
  task import_content_only: :environment do
    # Temporarily override Rails env to prevent Obsidian import
    original_env = Rails.env
    Rails.env = "production"
    ImportObsidianNotesJob.perform_now
    Rails.env = original_env
  end

  desc "Force import from Obsidian, overriding existing files"
  task force_import_obsidian: :environment do
    # Set override flag for the duration of this task
    ENV["OBSIDIAN_OVERRIDE"] = "true"
    ImportObsidianNotesJob.perform_now
    ENV["OBSIDIAN_OVERRIDE"] = nil
  end

  desc "Check R2 CDN configuration status"
  task r2_status: :environment do
    if R2ImageService.configured?
      puts "✓ R2 is configured"
      puts "  Bucket: #{R2ImageService.bucket_name}"
      puts "  Public URL: #{R2ImageService.public_url_base}"
    else
      puts "✗ R2 is NOT configured"
      puts "  Missing environment variables:"
      puts "    R2_ACCESS_KEY_ID" unless ENV["R2_ACCESS_KEY_ID"].present?
      puts "    R2_SECRET_ACCESS_KEY" unless ENV["R2_SECRET_ACCESS_KEY"].present?
      puts "    R2_ACCOUNT_ID" unless ENV["R2_ACCOUNT_ID"].present?
    end
  end

  desc "Create a new empty blog post in the content directory"
  task :new, [ :title ] => :environment do |_, args|
    require "date"
    require "fileutils"

    title = args[:title] || "New Blog Post"
    slug = title.parameterize
    date = Date.today.to_s
    filename = "#{slug}.md"

    content_dir = Rails.root.join("content", "blog_posts")
    FileUtils.mkdir_p(content_dir)

    full_path = File.join(content_dir, filename)

    # Don't overwrite existing files
    if File.exist?(full_path)
      puts "Error: A file with this name already exists: #{filename}"
      exit 1
    end

    # Create template
    template = <<~MARKDOWN
      ---
      title: "#{title}"
      date: #{date}
      slug: #{slug}
      draft: true
      ---

      Write your blog post content here...
    MARKDOWN

    File.write(full_path, template)

    puts "Created new blog post: #{full_path}"
    puts "Edit this file and run 'rake blog_posts:import' to process it"
  end
end
