import "@hotwired/turbo-rails"
import "@hotwired/stimulus"
import "./controllers"
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import HelloWorld from './components/HelloWorld'
import Sidebar from './components/Sidebar'
import AppleSidebar from './components/AppleSidebar'
import WorkExperience from "./components/WorkExperience"
import { MarkdownRenderer as MarkdownRendererNew } from './components/markdown'
import MarkdownRenderer from './components/MarkdownRenderer'
import GameCard from './components/GameCard'
import GamesGrid from './components/GamesGrid'
import AboutMe from './components/AboutMe'
import BentoHome from './components/BentoHome'
import Projects from './components/Projects'
import ProjectDetail from './components/ProjectDetail'
import ThemeLayout from './components/DarkModeLayout' // Renamed but kept same file
import { ThemeProvider } from './components/Theme'

const COMPONENTS = {
  'HelloWorld': HelloWorld,
  'Sidebar': Sidebar,
  'AppleSidebar': AppleSidebar,
  'MarkdownRenderer': MarkdownRenderer, // Use the direct component that's expected by blog/show.html.erb
  'MarkDownRenderer': MarkdownRendererNew, // Keep this for backward compatibility
  'GameCard': GameCard,
  'GamesGrid': GamesGrid,
  'WorkExperience': WorkExperience,
  'AboutMe': AboutMe,
  'BentoHome': BentoHome,
  'Projects': Projects,
  'ProjectDetail': ProjectDetail,
  'ThemeLayout': ThemeLayout, // New name
  'DarkModeLayout': ThemeLayout // For backwards compatibility 
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

document.addEventListener("turbo:load", () => {
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
        
        // Check if we already have a root for this container
        if (!roots.has(component)) {
          const root = createRoot(component)
          roots.set(component, root)
          
          // Wrap components that need theme context
          const needsThemeContext = ['AppleSidebar', 'BentoHome', 'Projects', 'ProjectDetail', 'AboutMe', 'WorkExperience', 'GameCard', 'Sidebar'];
          const componentToRender = needsThemeContext.includes(componentName) 
            ? <ThemeProvider><Component {...props} /></ThemeProvider>
            : <Component {...props} />;
          
          root.render(componentToRender)
          console.log(`Rendered ${componentName} with props:`, props)
        } else {
          // If we do have a root, just re-render it
          const existingRoot = roots.get(component)
          
          // Wrap components that need theme context
          const needsThemeContext = ['AppleSidebar', 'BentoHome', 'Projects', 'ProjectDetail', 'AboutMe', 'WorkExperience', 'GameCard', 'Sidebar'];
          const componentToRender = needsThemeContext.includes(componentName) 
            ? <ThemeProvider><Component {...props} /></ThemeProvider>
            : <Component {...props} />;
          
          existingRoot.render(componentToRender)
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
