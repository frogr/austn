module Admin
  class BlogPostsController < BaseController
    def index
      @blog_posts = BlogPost.all.sort_by { |p| p.published_at || p.created_at }.reverse
      @total_count = BlogPost.count
      @r2_configured = R2ImageService.configured?
    end

    def new
      @blog_post = BlogPost.new
    end

    def create
      @blog_post = BlogPost.new(blog_post_params)
      if @blog_post.save
        redirect_to admin_blog_posts_path, notice: "Blog post created."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit
      @blog_post = BlogPost.find(params[:id])
    end

    def update
      @blog_post = BlogPost.find(params[:id])
      if @blog_post.update(blog_post_params)
        redirect_to admin_blog_posts_path, notice: "Blog post updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @blog_post = BlogPost.find(params[:id])
      @blog_post.destroy
      redirect_to admin_blog_posts_path, notice: "Blog post deleted."
    end

    def sync_images
      @blog_post = BlogPost.find(params[:id])

      unless R2ImageService.configured?
        redirect_to admin_blog_posts_path, alert: "R2 is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ACCOUNT_ID."
        return
      end

      # Find the source markdown file for this post
      content_file = Rails.root.join("content", "blog_posts", "#{@blog_post.slug}.md")
      obsidian_file = find_obsidian_source(@blog_post.slug)

      source_file = obsidian_file || content_file
      source_dir = source_file ? File.dirname(source_file) : nil

      if source_dir && File.exist?(source_file)
        # Re-process images from the source file
        original_content = File.read(source_file)
        processed_content = process_images_for_sync(original_content, source_dir, source_file)

        # Update both the content file and database
        if processed_content != original_content
          File.write(content_file, processed_content) if content_file.to_s != source_file.to_s
          @blog_post.update(content: extract_markdown_content(processed_content))
          redirect_to admin_blog_posts_path, notice: "Images synced to R2 for '#{@blog_post.title}'."
        else
          redirect_to admin_blog_posts_path, notice: "No local images found to sync for '#{@blog_post.title}'."
        end
      else
        # No source file, try to process images directly from database content
        processed_content = process_images_for_sync(@blog_post.content, Rails.root.to_s, nil)

        if processed_content != @blog_post.content
          @blog_post.update(content: processed_content)
          redirect_to admin_blog_posts_path, notice: "Images synced to R2 for '#{@blog_post.title}'."
        else
          redirect_to admin_blog_posts_path, notice: "No local images found to sync for '#{@blog_post.title}'."
        end
      end
    end

    private

    def blog_post_params
      params.require(:blog_post).permit(:title, :content, :slug, :published_at)
    end

    def find_obsidian_source(slug)
      obsidian_path = ENV["OBSIDIAN_PATH"] || "/Users/austn/Library/Mobile Documents/iCloud~md~obsidian/Documents/Notes/public"
      return nil unless Dir.exist?(obsidian_path)

      # Search for matching file
      Dir.glob(File.join(obsidian_path, "**/*.md")).find do |file|
        File.basename(file, ".md").parameterize == slug
      end
    end

    def process_images_for_sync(content, source_dir, source_file)
      processed = content.dup

      # Wiki-style: ![[image.png]]
      processed.gsub!(/!\[\[([^\]]+\.(?:png|jpe?g|gif|webp|svg|avif))\]\]/i) do |match|
        image_ref = $1
        upload_image(image_ref, source_dir, source_file, match) do |cdn_url, alt_text|
          "![#{alt_text}](#{cdn_url})"
        end
      end

      # Standard markdown with local paths: ![alt](path) - skip http(s) URLs
      processed.gsub!(/!\[([^\]]*)\]\((?!https?:\/\/)([^)]+\.(?:png|jpe?g|gif|webp|svg|avif))\)/i) do |match|
        alt_text = $1
        image_ref = $2
        upload_image(image_ref, source_dir, source_file, match, alt_text) do |cdn_url, final_alt|
          "![#{final_alt}](#{cdn_url})"
        end
      end

      processed
    end

    def upload_image(image_ref, source_dir, source_file, original_match, alt_text = nil)
      image_path = find_image_file(image_ref, source_dir, source_file)

      unless image_path
        Rails.logger.warn "Image not found during sync: #{image_ref}"
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

    def find_image_file(image_ref, source_dir, source_file)
      clean_ref = image_ref.sub(%r{^\./}, "")
      vault_root = ENV["OBSIDIAN_VAULT_ROOT"] || "/Users/austn/Library/Mobile Documents/iCloud~md~obsidian/Documents/Notes"

      search_paths = [
        source_file ? File.join(File.dirname(source_file), clean_ref) : nil,
        source_file ? File.join(File.dirname(source_file), "attachments", File.basename(clean_ref)) : nil,
        File.join(source_dir, clean_ref),
        File.join(source_dir, "attachments", File.basename(clean_ref)),
        File.join(vault_root, "attachments", File.basename(clean_ref)),
        find_in_vault(File.basename(clean_ref), vault_root)
      ].compact

      search_paths.find { |path| File.exist?(path) }
    end

    def find_in_vault(filename, vault_root)
      return nil unless Dir.exist?(vault_root)
      Dir.glob(File.join(vault_root, "**", filename)).first
    end

    def extract_markdown_content(content)
      # Remove frontmatter if present
      if content.start_with?("---")
        parts = content.split("---", 3)
        return parts[2..-1].join("---").strip if parts.length >= 3
      end
      content
    end
  end
end
