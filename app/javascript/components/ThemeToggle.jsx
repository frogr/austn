import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeProvider';

/**
 * ThemeToggle - A button component that toggles between light and dark themes
 * Uses direct DOM manipulation as a backup if the context is not available
 */
const ThemeToggle = ({ className = '' }) => {
  // Track theme state locally
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Get initial theme from localStorage or document class
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    // Fallback to checking document class
    const root = document.documentElement;
    if (root.classList.contains('light-theme')) return 'light';
    return 'dark'; // Default
  });
  
  // Keep local state in sync with document class
  useEffect(() => {
    const checkTheme = () => {
      const root = document.documentElement;
      const isLightTheme = root.classList.contains('light-theme');
      const isDarkTheme = root.classList.contains('dark-theme');
      
      if (isLightTheme && currentTheme !== 'light') {
        setCurrentTheme('light');
      } else if (isDarkTheme && currentTheme !== 'dark') {
        setCurrentTheme('dark');
      }
    };
    
    // Check immediately and then run on document class changes
    checkTheme();
    
    // Create a MutationObserver to watch for class changes on the document root
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });
    
    // Start observing
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, [currentTheme]);
  
  // Toggle theme function
  const toggleTheme = () => {
    try {
      // Try to access the global ThemeContextValue directly
      if (window.ThemeContextValue && typeof window.ThemeContextValue.toggleTheme === 'function') {
        window.ThemeContextValue.toggleTheme();
        return;
      }
    } catch (e) {
      console.log('Error using global context, falling back to direct DOM manipulation');
    }
    
    // Fallback: direct DOM manipulation
    const root = document.documentElement;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Remove existing theme classes
    root.classList.remove('dark-theme', 'light-theme');
    
    // Add new theme class
    root.classList.add(`${newTheme}-theme`);
    
    // Update localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update local state
    setCurrentTheme(newTheme);
    
    console.log('Theme toggled to:', newTheme);
  };
  
  const isDark = currentTheme === 'dark';
  
  return (
    <button
      onClick={toggleTheme}
      className={`theme-button flex items-center gap-2 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <>
          <span className="material-icons">light_mode</span>
          <span className="hidden sm:inline">Light Mode</span>
        </>
      ) : (
        <>
          <span className="material-icons">dark_mode</span>
          <span className="hidden sm:inline">Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;