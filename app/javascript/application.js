import "@hotwired/turbo-rails"
import "@hotwired/stimulus"
import "./controllers"
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import HelloWorld from './components/HelloWorld'
import Sidebar from './components/Sidebar'
import WorkExperience from "./components/WorkExperience"
import { MarkdownRenderer as MarkdownRendererNew } from './components/markdown'
import MarkdownRenderer from './components/MarkdownRenderer'
import GameCard from './components/GameCard'
import GamesGrid from './components/GamesGrid'
import AboutMe from './components/AboutMe'
import ContactInfo from './components/ContactInfo'
import FunProjects from './components/FunProjects'
import ThemeLayout from './components/ThemeLayout' // Use the new ThemeLayout component
import ThemeProvider from './components/ThemeProvider'
import ThemeToggle from './components/ThemeToggle'

const COMPONENTS = {
  'HelloWorld': HelloWorld,
  'Sidebar': Sidebar,
  'MarkdownRenderer': MarkdownRenderer, // Use the direct component that's expected by blog/show.html.erb
  'MarkDownRenderer': MarkdownRendererNew, // Keep this for backward compatibility
  'GameCard': GameCard,
  'GamesGrid': GamesGrid,
  'WorkExperience': WorkExperience,
  'AboutMe': AboutMe,
  'ContactInfo': ContactInfo,
  'FunProjects': FunProjects,
  'ThemeLayout': ThemeLayout, // New name
  'DarkModeLayout': ThemeLayout, // For backwards compatibility 
  'ThemeProvider': ThemeProvider,
  'ThemeToggle': ThemeToggle
}

// Store our roots so we can track which elements have been initialized
const roots = new Map()

// Custom event to communicate between components
window.sidebarEvents = {
  TOGGLE: 'sidebar:toggle',
  COLLAPSED: 'sidebar:collapsed',
  EXPANDED: 'sidebar:expanded'
};

// No need for margin adjustments with grid layout

// Create a global ThemeProvider instance that exists outside
// of the component lifecycle to ensure theme is applied immediately
const initializeThemeProvider = () => {
  // Check if we already have a ThemeProvider
  if (!window.themeProviderRoot) {
    // Create a div to hold the ThemeProvider
    const themeProviderContainer = document.createElement('div')
    themeProviderContainer.id = 'theme-provider-root'
    document.body.appendChild(themeProviderContainer)
    
    // Create the root and render the ThemeProvider
    const themeProviderRoot = createRoot(themeProviderContainer)
    themeProviderRoot.render(<ThemeProvider />)
    window.themeProviderRoot = themeProviderRoot
    console.log('Global ThemeProvider initialized')
  }
}

// Initialize ThemeProvider immediately
initializeThemeProvider()

document.addEventListener("turbo:load", () => {
  // Ensure ThemeProvider is initialized on each page load
  initializeThemeProvider()
  
  const reactComponents = document.querySelectorAll("[data-react-component]")
  
  reactComponents.forEach(component => {
    const componentName = component.dataset.reactComponent
    const Component = COMPONENTS[componentName]
    
    if (Component) {
      try {
        // Get component props if they exist
        const propsStr = component.dataset.props
        console.log(`Found ${componentName} with props:`, propsStr ? propsStr.substring(0, 100) + '...' : 'none')
        
        let props = {}
        if (propsStr) {
          try {
            props = JSON.parse(propsStr)
            console.log(`Successfully parsed props for ${componentName}:`, Object.keys(props))
            // More detailed logging for GamesGrid component
            if (componentName === 'GamesGrid') {
              console.log('GamesGrid props detail:', JSON.stringify(props, null, 2))
            }
          } catch (e) {
            console.error(`Error parsing props for ${componentName}:`, e)
            console.log('Raw props string:', propsStr)
          }
        }
        
        // Skip rendering another ThemeProvider since we have a global one
        if (componentName === 'ThemeProvider') {
          console.log('Skipping additional ThemeProvider render because we have a global one')
          return
        }
        
        // Check if we already have a root for this container
        if (!roots.has(component)) {
          const root = createRoot(component)
          roots.set(component, root)
          root.render(<Component {...props} />)
          console.log(`Rendered ${componentName} with props:`, props)
        } else {
          // If we do have a root, just re-render it
          const existingRoot = roots.get(component)
          existingRoot.render(<Component {...props} />)
          console.log(`Re-rendered ${componentName} with props:`, props)
        }
        
        // No need for margin adjustments with grid layout
      } catch (e) {
        console.error(`Error rendering ${componentName}:`, e)
      }
    } else {
      console.error(`Component ${componentName} not found in COMPONENTS map`)
    }
  })
})

// Clean up roots when elements are removed
document.addEventListener("turbo:before-cache", () => {
  roots.forEach((root, container) => {
    root.unmount()
  })
  roots.clear()
})