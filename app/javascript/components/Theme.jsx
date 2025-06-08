import React, { createContext, useContext } from 'react';
import { useGlobalTheme } from './GlobalThemeManager';

// Create context and export it for components that use useContext directly
export const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children, initialTheme = 'dark' }) => {
  // Use global theme state
  const { theme, toggleTheme, setTheme } = useGlobalTheme();

  const value = {
    theme,
    toggleTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Toggle Button Component
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

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

// Export a standalone provider that sets up theme but returns null
// This is for backward compatibility with the current setup
export const StandaloneThemeProvider = ({ initialTheme = 'dark' }) => {
  // Just initialize the global theme manager
  // The GlobalThemeManager handles all the DOM updates
  return null;
};

// Default export for backward compatibility
export default StandaloneThemeProvider;