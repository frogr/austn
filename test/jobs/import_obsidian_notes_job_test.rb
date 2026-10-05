require "test_helper"

class ImportObsidianNotesJobTest < ActiveJob::TestCase
  setup { @job = ImportObsidianNotesJob.new }

  test "front matter with an unquoted date is parsed instead of ending up in the post" do
    front_matter, body = @job.send(:extract_frontmatter, <<~MD)
      ---
      title: "A real title"
      date: 2026-03-17
      slug: a-real-title
      ---

      The body.
    MD

    assert_equal "A real title", front_matter["title"]
    assert_equal Date.new(2026, 3, 17), front_matter["date"]
    assert_equal "The body.", body.strip
  end

  test "imports a post with its front matter title and date, and keeps drafts unpublished" do
    Dir.mktmpdir do |dir|
      File.write(File.join(dir, "post.md"), "---\ntitle: \"Imported\"\ndate: 2026-01-02\nslug: imported\n---\n\nHello.\n")
      File.write(File.join(dir, "draft.md"), "---\ntitle: \"Later\"\ndate: 2026-01-03\nslug: later\ndraft: true\n---\n\nSoon.\n")

      @job.send(:process_markdown_file, File.join(dir, "post.md"))
      @job.send(:process_markdown_file, File.join(dir, "draft.md"))
    end

    post = BlogPost.find_by!(slug: "imported")
    assert_equal "Imported", post.title
    assert_equal "Hello.", post.content
    assert_equal Date.new(2026, 1, 2), post.published_at.to_date
    assert_nil BlogPost.find_by!(slug: "later").published_at
  end

  test "every post in the repo has front matter with a title, date and slug" do
    Dir.glob(ImportObsidianNotesJob::CONTENT_BLOG_POSTS_PATH.join("*.md")).each do |path|
      next if File.basename(path) == "README.md"

      front_matter, = @job.send(:extract_frontmatter, File.read(path))
      %w[title date slug].each { |key| assert front_matter[key].present?, "#{File.basename(path)} is missing #{key}" }
    end
  end
end
