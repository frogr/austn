import React, { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => {
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    const updateThemeFromDOM = () => {
      const root = document.documentElement;
      const isLightTheme = root.classList.contains('light-theme');
      setTheme(isLightTheme ? 'light' : 'dark');
    };
    
    updateThemeFromDOM();
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          updateThemeFromDOM();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);
  
  return { 
    theme, 
    toggleTheme: window.ThemeContextValue?.toggleTheme || (() => {})
  };
};