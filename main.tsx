import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './App.css'

// Ensure Google Fonts are always loaded even in production
// as a failsafe in case the HTML head import doesn't work
const loadFonts = () => {
  // Check if fonts are already loaded
  if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
    const fontLink = document.createElement('link')
    fontLink.rel = 'stylesheet'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&family=Press+Start+2P&display=swap'
    document.head.appendChild(fontLink)
  }
}

loadFonts()

// Super-simplified mounting code
const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(<App />)
  console.log("React app mounted successfully")
} else {
  console.error("Could not find root element to mount React application")
}