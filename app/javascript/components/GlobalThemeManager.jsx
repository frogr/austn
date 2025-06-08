import React, { useState, useEffect } from 'react';

// Global theme state
let globalTheme = localStorage.getItem('theme') || 'dark';
let themeListeners = [];

// Subscribe to theme changes
export const subscribeToTheme = (callback) => {
  themeListeners.push(callback);
  return () => {
    themeListeners = themeListeners.filter(cb => cb !== callback);
  };
};

// Update theme globally
export const setGlobalTheme = (newTheme) => {
  globalTheme = newTheme;
  localStorage.setItem('theme', newTheme);
  
  // Update DOM
  const root = document.documentElement;
  root.classList.remove('light-theme', 'dark-theme');
  root.classList.add(`${newTheme}-theme`);
  
  // Notify all listeners
  themeListeners.forEach(callback => callback(newTheme));
};

// Get current theme
export const getGlobalTheme = () => globalTheme;

// Custom hook to use global theme
export const useGlobalTheme = () => {
  const [theme, setTheme] = useState(getGlobalTheme());
  
  useEffect(() => {
    const unsubscribe = subscribeToTheme(setTheme);
    return unsubscribe;
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setGlobalTheme(newTheme);
  };
  
  return { theme, toggleTheme, setTheme: setGlobalTheme };
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  const root = document.documentElement;
  root.classList.remove('light-theme', 'dark-theme');
  root.classList.add(`${globalTheme}-theme`);
}