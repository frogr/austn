import React from 'react';

/**
 * DarkModeLayout - A wrapper component that applies dark mode styling
 * Use this component to wrap page content that should have dark mode styling
 */
const DarkModeLayout = ({ children, className = '' }) => {
  return (
    <div className={`bg-black text-white min-h-screen ${className}`}>
      <div className="max-w-4xl mx-auto py-8 px-4" dangerouslySetInnerHTML={{ __html: '' }}>
        {children}
      </div>
    </div>
  );
};

export default DarkModeLayout;