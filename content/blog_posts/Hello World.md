Hello! This is my first blog post on austn.net.

I'm Austin French, a backend developer from California. Lately I've been trying to use AI to learn as much as I possibly can. Part of that means I'll need a place to write my notes! 

## The Method: Obsidian

Currently I'm using Obsidian for most of my writing. I love the markdown interface, and owning my own files makes it a tempting choice. There's, of course, great tagging system, inter and intra hyperlinks, and a mind-map. I'm less interested in those features -- but there's a lot of reason to pick Obsidian over other tools like Notion or Apple Notes.

Of course, there's a time and a place for everything.

Eventually I will write an in-depth article about how I built this website, but for now I figure this could be a good time to discuss this specific feature!

### The code!
A thousand miles in the sky, this website is a simple React on Rails app. I manage it with Hatchbox on my personal DigitalOcean instance.

On the other end, I write in Obsidian:
![Obsidian Notes Screenshot](https://media.cleanshot.cloud/media/116489/NVsgdzyNI6fp5ckJPvNo9ZiNcPMDARGIQOhmVaXK.jpeg?Expires=1742991391&Signature=OoAhVHykvx276sSDPZDbVwfxAIayHQsR8d4wj16okBVEWV9Qb5NR~dWcMe0dbju2vmk-k3kvSc-898grQjQYrU-hm5T1wdJPGPHqu6gKetw6fT-6YafVyR~4M7TOkxmUHy0lQUemY1eM2l~OgAQZDKWvD-TRh~a6mhVZvZb2cW8yvk5Me-e148RuYaP5Wl1KHTXPVEPHSwZ5xaXqYRhZcWR~uSvCOTtg2AjB0REBSIngcNuynQ8KJFVGV3KVh4wxbh522HXiu1K-1LG2FNIiCeXi97a3gHf9I8mWCg6KoDJ951Ie0TuQX1XecFP9oPz-uMg80RxrB2rsVhFWGVf~XQ__&Key-Pair-Id=K269JMAT9ZF4GZ)


Then I use this script to automatically check for new markdown files upon deploy:
```ruby
class ImportObsidianNotesJob < ApplicationJob
  queue_as :default

  OBSIDIAN_PUBLIC_PATH = File.join(
    ENV["OBSIDIAN_PATH"] || File.join(Dir.home, "PATH_TO_OBSIDIAN_VAULT")
  )
  
  CONTENT_BLOG_POSTS_PATH = Rails.root.join("content", "blog_posts")

  def perform
    FileUtils.mkdir_p(CONTENT_BLOG_POSTS_PATH)
    
    if ENV["OBSIDIAN_PATH"] && Dir.exist?(OBSIDIAN_PUBLIC_PATH)
      import_from_obsidian
    else
      import_from_content_directory
    end
  end

  private
  
  def import_from_obsidian
    Rails.logger.info "Importing markdown files from Obsidian at #{OBSIDIAN_PUBLIC_PATH}"

    Dir.glob(File.join(OBSIDIAN_PUBLIC_PATH, "**/*.md")).each do |file_path|
      filename = File.basename(file_path)
      target_path = File.join(CONTENT_BLOG_POSTS_PATH, filename)
      FileUtils.cp(file_path, target_path)
      Rails.logger.info "Copied #{filename} to content directory"
      process_markdown_file(file_path)
    end
  end
  
  def import_from_content_directory
    Rails.logger.info "Importing markdown files from content directory at #{CONTENT_BLOG_POSTS_PATH}"
    
    Dir.glob(File.join(CONTENT_BLOG_POSTS_PATH, "*.md")).each do |file_path|
      process_markdown_file(file_path)
    end
  end

  def process_markdown_file(file_path)
    content = File.read(file_path)
    filename = File.basename(file_path, ".md")
    frontmatter, markdown_content = extract_frontmatter(content)
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
```

Note this has two branches of logic: Locally, we're pulling directly from Obsidian and creating markdown files. Then, in production we're reading from those files to generate BlogPosts that show up at `austn.net/blog`


We also hooked up a postdeploy script here:
```js
     {
       "scripts": {
         "postdeploy": "bundle exec rails runner 'PostDeployJob.perform_now'"
       }
     }
```

which runs this simple job after each deploy:
```ruby
class PostDeployJob < ApplicationJob
  queue_as :critical

  def perform
    ImportObsidianNotesJob.perform_now
  end
end
```


This is, naturally, a super quick overview. But I wanted to show that it works! And, I also wanted to show off some of the other cool markdown features we have like:
- lists
- that
- aren't
- ordered

But also:
1. Even
2. Ordered
3. Lists!

`single line of code` works for a single line of code

>We have quotes

We also have quotes! And **bold** and *italics*!


Heh. Thanks for reading.


Austin