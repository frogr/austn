# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create a sample blog post with Markdown content for testing
BlogPost.find_or_create_by!(title: "Markdown Test Post") do |post|
  post.content = <<-MARKDOWN
# Markdown Test Post

This is a test post to demonstrate Markdown rendering capabilities with React.

## Headers

### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header

## Text Formatting

This is **bold text** and this is *italic text*.

This is ***bold and italic*** text.

## Blockquotes

> This is a single line blockquote

> This is a multi-line blockquote
> with multiple lines
> to demonstrate formatting

## Lists

### Unordered Lists

* Item 1
* Item 2
  * Nested Item 2.1
  * Nested Item 2.2
* Item 3

### Ordered Lists

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

## Code

Inline `code` looks like this.

```ruby
# This is a Ruby code block
class BlogPost < ApplicationRecord
  validates :title, presence: true
  validates :content, presence: true
#{'  '}
  def self.published
    where.not(published_at: nil)
  end
end
```

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
| Row 3    | Data     | Data     |

## Links

[This is a link to Google](https://www.google.com)

## Images

![Sample Image](https://via.placeholder.com/150)

## Task Lists

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

MARKDOWN
  post.published_at = Time.current
end

# Create sample game posts
puts "Creating game posts..."
[
  {
    title: "Arena Shooter",
    description: "Fast-paced 2D arena shooter with enemies, power-ups, and high scores.",
    image_url: "/assets/images/games/arena-shooter.jpg",
    link: "/portfolio/arena_shooter",
    featured: true
  },
  {
    title: "Platformer",
    description: "Classic side-scrolling platformer with collectibles and obstacles.",
    image_url: "/assets/images/games/platformer.jpg",
    link: "#",
    featured: false
  },
  {
    title: "Puzzle Game",
    description: "Brain-teasing puzzle game with multiple levels of difficulty.",
    image_url: "/assets/images/games/puzzle.jpg",
    link: "#",
    featured: false
  },
  {
    title: "RPG Adventure",
    description: "Story-driven RPG with character progression and turn-based combat.",
    image_url: "/assets/images/games/rpg.jpg",
    link: "#",
    featured: false
  }
].each do |game_data|
  GamePost.find_or_create_by!(title: game_data[:title]) do |game|
    game.description = game_data[:description]
    game.image_url = game_data[:image_url]
    game.link = game_data[:link]
    game.featured = game_data[:featured]
  end
end

# Create sample work posts
puts "Creating work posts..."
[
  {
    title: "E-commerce Redesign",
    description: "A complete overhaul of an online store with improved UX and conversion rates.",
    image_url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    tags: ["React", "Node.js", "Tailwind CSS"],
    featured: true
  },
  {
    title: "Health App Dashboard",
    description: "An intuitive dashboard for a health tracking application with data visualization.",
    image_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    tags: ["Vue.js", "D3.js", "Firebase"],
    featured: true
  },
  {
    title: "Financial Analytics Platform",
    description: "A comprehensive platform for financial data analysis and reporting.",
    image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    tags: ["TypeScript", "React", "MongoDB"],
    featured: false
  },
  {
    title: "Travel Blog",
    description: "A responsive travel blog with dynamic content and interactive maps.",
    image_url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    tags: ["WordPress", "PHP", "JavaScript"],
    featured: false
  }
].each do |work_data|
  WorkPost.find_or_create_by!(title: work_data[:title]) do |work|
    work.description = work_data[:description]
    work.image_url = work_data[:image_url]
    work.tags = work_data[:tags]
    work.featured = work_data[:featured]
  end
end

puts "Seed data created successfully!"
