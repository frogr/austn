# Blog Post Development Workflow

This document explains how to work with the blog post import system in development and production environments.

## Adding New Blog Posts

### Option 1: Direct Creation (Recommended for Development)

1. Create a new markdown file in the `content/blog_posts/` directory with proper frontmatter
2. Run the importer to process the file: `bundle exec rails blog_posts:import`
3. Commit the file to version control

Example file format:

```markdown
---
title: "My New Blog Post"
date: 2025-03-25
slug: my-new-blog-post  # Optional (derived from title if not provided)
draft: false           # Set to true to hide from production
---

Post content in markdown format goes here...
```

### Option 2: Import from Obsidian (Requires Obsidian Setup)

1. Create new blog posts in Obsidian within the configured public directory
2. Run the import job: `bundle exec rails blog_posts:import`
3. Review the imported files in the `content/blog_posts/` directory
4. Commit the new markdown files to version control

## Updating Existing Posts

1. Edit the markdown file in `content/blog_posts/`
2. Run the importer to process the file: `bundle exec rails blog_posts:import`
3. Commit your changes to version control

## Deployment Process

The system automatically imports blog posts from the `content/blog_posts/` directory during deployment via the `PostDeployJob`.

## Important Notes

- All blog post markdown files are committed to version control
- The Obsidian import is a one-way sync that copies files to the content directory
- In production, only the files in the `content/blog_posts/` directory are used
- Files marked as `draft: true` will not be displayed on the site

## Troubleshooting

If posts aren't appearing:
- Check if the frontmatter has `draft: true`
- Verify the file was processed by running the import manually
- Check the Rails logs for any import errors