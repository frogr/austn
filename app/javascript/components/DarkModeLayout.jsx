import React from 'react';

// Simple dark-only layout wrapper
const ThemeLayout = ({ children, className = '' }) => (
  <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className={`min-h-screen ${className}`}>
    <div className="max-w-4xl mx-auto py-8 px-4">
      {children}
    </div>
  </div>
);

export default ThemeLayout;
