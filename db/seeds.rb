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
