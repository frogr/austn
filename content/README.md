# Blog Content Directory

This directory contains markdown files for the blog posts displayed on the website.

## Structure

- `blog_posts/` - Contains all markdown blog post files

## Workflow

### Development

1. Write new blog posts in Obsidian in the configured public directory
2. Run the import job to copy and process files: `bundle exec rails blog_posts:import`
3. Review the imported posts in your local environment
4. Commit the markdown files to version control

### Production

- The system will use the markdown files committed to this directory
- Files are automatically processed during deployment via the PostDeployJob

## File Format

Blog posts use markdown with YAML frontmatter:

```markdown
---
title: "My Blog Post Title"
date: 2025-03-25
slug: custom-url-slug  # Optional (derived from title if not provided)
draft: false          # Set to true to hide from production
---

Post content in markdown format goes here...
```

## Notes

- Files marked as `draft: true` will not be displayed on the site
- All markdown files in this directory should be committed to version control
- The import process from Obsidian is a one-way sync that copies files here