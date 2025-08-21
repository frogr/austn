import React, { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { useMarkdownContent } from './useMarkdownContent';
import MarkdownComponents from './MarkdownComponents';
import './markdown-styles.css';
import { ThemeContext } from '../Theme';

const MarkdownRenderer = ({ content, slug, useElementId }) => {
  const { markdownContent, loading, error, contentMeta } = useMarkdownContent({
    content,
    slug,
    useElementId
  });
  
  // Get the current theme from context
  let theme = 'dark'; // Default
  try {
    // Try to get the theme from context, but it might not be available if ThemeProvider is not a parent
    const themeContext = useContext(ThemeContext);
    if (themeContext) {
      theme = themeContext.theme;
    }
  } catch (e) {
    console.log('ThemeContext not available, using default theme');
  }
  
  if (loading) return <div className="py-4">Loading content...</div>;
  if (error) return <div className="py-4 text-red-500">Error loading content: {error}</div>;
  if (!markdownContent) return <div className="py-4">No content available</div>;
  
  // Add appropriate classes based on the theme
  const themeClass = theme === 'dark' ? 'prose-invert' : '';
  
  return (
    <div className={`markdown-content prose prose-lg max-w-none ${themeClass} break-words`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={MarkdownComponents}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;