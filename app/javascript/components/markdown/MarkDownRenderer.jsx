import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { useMarkdownContent } from './useMarkdownContent';
import MarkdownComponents from './MarkdownComponents';
import DebugPanel from './DebugPanel';
import './markdown-styles.css';

const MarkdownRenderer = ({ content, slug, useElementId }) => {
  const { markdownContent, loading, error, contentMeta } = useMarkdownContent({
    content,
    slug,
    useElementId
  });
  
  if (loading) return <div className="py-4">Loading content...</div>;
  if (error) return <div className="py-4 text-red-500">Error loading content: {error}</div>;
  if (!markdownContent) return <div className="py-4">No content available</div>;
  
  const isDev = process.env.NODE_ENV !== 'production';
  
  return (
    <div className="markdown-content prose prose-lg max-w-none">
      {isDev && <DebugPanel slug={slug} useElementId={useElementId} content={markdownContent} />}
      
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