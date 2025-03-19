import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';

const MarkdownRenderer = ({ content, slug, useElementId }) => {
  const [markdownContent, setMarkdownContent] = useState(content || '');
  const [loading, setLoading] = useState(!content && !useElementId && !!slug);
  const [error, setError] = useState(null);
  
  // On first render, check if we should get content from a DOM element
  useEffect(() => {
    if (useElementId) {
      const element = document.getElementById(useElementId);
      if (element) {
        console.log(`Getting content from element #${useElementId}`);
        
        // Handle different types of content storage
        let extractedContent = '';
        
        if (element.tagName === 'SCRIPT' && element.type === 'application/json') {
          try {
            // Parse JSON content from script tag
            extractedContent = JSON.parse(element.textContent || element.innerText);
            console.log('Successfully extracted JSON content');
          } catch (e) {
            console.error('Error parsing JSON content from script tag:', e);
            extractedContent = element.textContent || element.innerText;
          }
        } else {
          // Regular element, just get the text
          extractedContent = element.textContent || element.innerText;
        }
        
        setMarkdownContent(extractedContent);
        setLoading(false);
        return;
      } else {
        console.error(`Element with ID ${useElementId} not found`);
      }
    }
    
    // If direct content is provided, use that
    if (content) {
      console.log('Using directly provided content');
      setMarkdownContent(content);
      setLoading(false);
      return;
    }
    
    // Otherwise, fetch content using the slug
    if (slug && !useElementId) {
      console.log(`Fetching content for slug: ${slug}`);
      setLoading(true);
      fetch(`/blog/${slug}/content`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch markdown content');
          }
          return response.json();
        })
        .then(data => {
          console.log('Fetched content:', data);
          setMarkdownContent(data.content);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching markdown:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [content, slug, useElementId]);
  
  if (loading) {
    return <div className="py-4">Loading content...</div>;
  }
  
  if (error) {
    return <div className="py-4 text-red-500">Error loading content: {error}</div>;
  }
  
  if (!markdownContent) {
    return <div className="py-4">No content available</div>;
  }
  
  console.log('Rendering markdown content:', markdownContent.substring(0, 100) + '...');
  
  // Add debugging in development
  const isDev = process.env.NODE_ENV !== 'production';
  
  return (
    <div className="markdown-content prose prose-lg max-w-none">
      {isDev && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffe', border: '1px solid #ddd', fontSize: '14px' }}>
          <p><strong>Debug Info:</strong></p>
          <p>Slug: {slug || 'No slug provided'}</p>
          <p>Using element ID: {useElementId || 'None'}</p>
          <p>Content length: {markdownContent ? markdownContent.length : 0} characters</p>
          <p>Content preview: {markdownContent ? markdownContent.substring(0, 50) + '...' : 'None'}</p>
        </div>
      )}
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={{
          // Improve heading rendering
          h1: ({node, children, ...props}) => (
            <h1 className="text-4xl font-bold mt-6 mb-4" {...props}>
              {children}
            </h1>
          ),
          h2: ({node, children, ...props}) => (
            <h2 className="text-3xl font-bold mt-5 mb-4" {...props}>
              {children}
            </h2>
          ),
          h3: ({node, children, ...props}) => (
            <h3 className="text-2xl font-bold mt-4 mb-3" {...props}>
              {children}
            </h3>
          ),
          
          // Make sure lists render properly
          ul: ({node, children, ...props}) => (
            <ul className="markdown-list-disc list-disc pl-8 my-4" style={{listStyleType: 'disc', paddingLeft: '2em'}} {...props}>
              {children}
            </ul>
          ),
          ol: ({node, children, ...props}) => (
            <ol className="markdown-list-decimal list-decimal pl-8 my-4" style={{listStyleType: 'decimal', paddingLeft: '2em'}} {...props}>
              {children}
            </ol>
          ),
          li: ({node, children, ...props}) => (
            <li className="mb-2" style={{display: 'list-item'}} {...props}>
              {children}
            </li>
          ),
          
          // Better code block rendering
          code: ({node, inline, className, children, ...props}) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="code-block-wrapper">
                <div className="code-block-header">{match[1]}</div>
                <pre className={className}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;