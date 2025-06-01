import React from 'react';
import Sidebar from './Sidebar';

/**
 * ThemeLayout - A wrapper component that applies the current theme styling
 * and includes standard layout elements like the sidebar
 */
const ThemeLayout = ({ children, className = '', showSidebar = true, title = null }) => {
  return (
    <div className="min-h-screen w-full bg-primary text-primary">
      {showSidebar && <Sidebar />}
      
      <main className={`transition-all duration-300 ${showSidebar ? 'ml-16' : ''} ${className}`}>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {title && <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-primary">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
};

export default ThemeLayout;