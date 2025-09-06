import React, { createContext, useContext } from 'react';

// Minimal dark-only theme context
export const ThemeContext = createContext({ theme: 'dark' });

// Dark-only Theme Provider
export const ThemeProvider = ({ children }) => {
  const value = { theme: 'dark' };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Hook returns dark theme always
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  return ctx || { theme: 'dark' };
};

export default ThemeProvider;
