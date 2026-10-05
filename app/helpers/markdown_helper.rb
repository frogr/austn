# Renders the site's own markdown (case studies, playground pages, blog posts).
# This content comes from files in the repo, so inline HTML is allowed, which is
# how case studies embed their SVG diagrams.
module MarkdownHelper
  class SiteRenderer < Redcarpet::Render::HTML
    # Links that leave the site open normally, but get rel=noopener.
    def link(link, title, content)
      attrs = { href: link, title: title.presence }
      attrs[:rel] = "noopener" if link.to_s.start_with?("http")
      ActionController::Base.helpers.content_tag(:a, content.html_safe, attrs)
    end
  end

  def markdown(text)
    renderer = SiteRenderer.new(with_toc_data: true)
    parser = Redcarpet::Markdown.new(
      renderer,
      autolink: true,
      tables: true,
      fenced_code_blocks: true,
      strikethrough: true,
      no_intra_emphasis: true,
      lax_spacing: true
    )
    parser.render(text.to_s).html_safe # rubocop:disable Rails/OutputSafety
  end
end
