import { useState, useEffect } from 'react';

export const useMarkdownContent = ({ content, slug, useElementId }) => {
  const [markdownContent, setMarkdownContent] = useState(content || '');
  const [loading, setLoading] = useState(!content && !useElementId && !!slug);
  const [error, setError] = useState(null);
  const [contentMeta, setContentMeta] = useState({
    length: 0,
    preview: ''
  });

  useEffect(() => {
    // Case 1: Content from DOM element
    if (useElementId) {
      const extractedContent = extractContentFromElement(useElementId);
      if (extractedContent) {
        setMarkdownContent(extractedContent);
        setContentMeta(updateContentMeta(extractedContent));
        setLoading(false);
        return;
      }
    }
    
    // Case 2: Direct content prop
    if (content) {
      console.log('Using directly provided content');
      setMarkdownContent(content);
      setContentMeta(updateContentMeta(content));
      setLoading(false);
      return;
    }
    
    // Case 3: Fetch content using slug
    if (slug && !useElementId) {
      fetchContentBySlug(slug)
        .then(fetchedContent => {
          setMarkdownContent(fetchedContent);
          setContentMeta(updateContentMeta(fetchedContent));
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching markdown:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [content, slug, useElementId]);

  return { markdownContent, loading, error, contentMeta };
};

// Helper functions
function extractContentFromElement(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return null;
  }
  
  console.log(`Getting content from element #${elementId}`);
  
  // Handle different types of content storage
  if (element.tagName === 'SCRIPT' && element.type === 'application/json') {
    try {
      return JSON.parse(element.textContent || element.innerText);
    } catch (e) {
      console.error('Error parsing JSON content from script tag:', e);
      return element.textContent || element.innerText;
    }
  } 
  
  // Regular element, just get the text
  return element.textContent || element.innerText;
}

function updateContentMeta(content) {
  if (!content) return;
  
  return {
    length: content.length,
    preview: content.substring(0, 50) + '...'
  };
}

async function fetchContentBySlug(slug) {
  console.log(`Fetching content for slug: ${slug}`);
  const response = await fetch(`/blog/${slug}/content`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch markdown content');
  }
  
  const data = await response.json();
  console.log('Fetched content:', data);
  return data.content;
}