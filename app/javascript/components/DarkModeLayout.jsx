import React, { useState, useEffect } from 'react';

/**
 * ThemeLayout - A wrapper component that applies the current theme styling
 * Use this component to wrap page content that should have themed styling
 */
const ThemeLayout = ({ children, className = '' }) => {
  const [themeState, setThemeState] = useState(() => {
    // Initialize from document class
    return document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
  });
  
  // Update theme state when document classes change
  useEffect(() => {
    const updateThemeFromDOM = () => {
      const root = document.documentElement;
      const isLightTheme = root.classList.contains('light-theme');
      setThemeState(isLightTheme ? 'light' : 'dark');
    };
    
    // Create a MutationObserver to watch for class changes on the document root
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateThemeFromDOM();
        }
      });
    });
    
    // Start observing
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  const isDark = themeState === 'dark';
  
  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} className={`min-h-screen ${className}`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {children}
      </div>
    </div>
  );
};

export default ThemeLayout;