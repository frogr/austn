import React, { createContext, useState, useEffect } from 'react';

// Initialize the global context
if (!window.ThemeContextValue) {
  window.ThemeContextValue = {
    theme: 'dark',
    setTheme: () => {},
    toggleTheme: () => {}
  };
}

const ThemeContextValue = window.ThemeContextValue;

export const ThemeContext = createContext(ThemeContextValue);

/**
 * ThemeProvider - Sets up and manages global theme state
 * This component doesn't render anything visible, it just sets up the theme context
 */
const ThemeProvider = ({ initialTheme = 'dark' }) => {
  // Initialize with either initialTheme prop or the saved theme from localStorage
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || initialTheme;
  });
  
  // Apply theme class to root element
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('dark-theme', 'light-theme');
    
    // Add the current theme class
    root.classList.add(`${theme}-theme`);
    
    // Store theme preference in localStorage
    localStorage.setItem('theme', theme);
    
    console.log('Theme set to:', theme);
    
    // Update the global ThemeContextValue object
    ThemeContextValue.theme = theme;

    // Setup storage event listener to sync theme across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'theme' && e.newValue !== theme) {
        setTheme(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [theme]);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    console.log('Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };
  
  // Update the global context methods
  useEffect(() => {
    // Define the methods directly on the global object
    window.ThemeContextValue.setTheme = setTheme;
    window.ThemeContextValue.toggleTheme = toggleTheme;
  }, [toggleTheme]);
  
  // This component doesn't need to render anything visible
  return null;
};

export default ThemeProvider;