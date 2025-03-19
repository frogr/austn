// File: app/javascript/components/markdown/DebugPanel.jsx
import React from 'react';

const DebugPanel = ({ slug, useElementId, content }) => {
  if (!content) return null;
  
  return (
    <div 
      style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#ffe', 
        border: '1px solid #ddd', 
        fontSize: '14px' 
      }}
    >
      <p><strong>Debug Info:</strong></p>
      <p>Slug: {slug || 'No slug provided'}</p>
      <p>Using element ID: {useElementId || 'None'}</p>
      <p>Content length: {content ? content.length : 0} characters</p>
      <p>Content preview: {content ? content.substring(0, 50) + '...' : 'None'}</p>
    </div>
  );
};

export default DebugPanel;