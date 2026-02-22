import "@hotwired/turbo-rails"
import "./controllers"
import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './components/Theme'

// Lazy-load components to keep the main bundle small.
// Each component becomes its own chunk and only loads when present in the DOM.
const COMPONENT_LOADERS = {
  HelloWorld: () => import('./components/HelloWorld'),
  Sidebar: () => import('./components/Sidebar'),
  WorkExperience: () => import('./components/WorkExperience'),
  MarkdownRenderer: () => import('./components/MarkdownRenderer'),
  MarkDownRenderer: () => import('./components/markdown/MarkDownRenderer'),
  GameCard: () => import('./components/GameCard'),
  GamesGrid: () => import('./components/GamesGrid'),
  AboutMe: () => import('./components/AboutMe'),
  BentoHome: () => import('./components/BentoHome'),
  Projects: () => import('./components/Projects'),
  ProjectDetail: () => import('./components/ProjectDetail'),
  ThemeLayout: () => import('./components/DarkModeLayout'),
  DarkModeLayout: () => import('./components/DarkModeLayout'),
  Chat: () => import('./components/Chat'),
  DAW: () => import('./components/daw/DAW'),
  EndlessStory: () => import('./components/EndlessStory'),
  Resume: () => import('./components/Resume'),
  ClaudeCorner: () => import('./components/ClaudeCorner')
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
    const loader = COMPONENT_LOADERS[componentName]
    if (loader) {
      try {
        // Get component props if they exist
        const propsStr = component.dataset.props
        
        let props = {}
        if (propsStr) {
          try {
            props = JSON.parse(propsStr)
          } catch (e) {
            console.error(`Error parsing props for ${componentName}:`, e)
          }
        }
        
        // Dynamically import only when needed
        loader().then(mod => {
          const Component = mod.default || mod[componentName]
          if (!Component) {
            console.error(`Component module loaded but no export found for ${componentName}`)
            return
          }

          // Check if we already have a root for this container
          if (!roots.has(component)) {
            const root = createRoot(component)
            roots.set(component, root)
          }

          const needsThemeContext = ['BentoHome', 'Projects', 'ProjectDetail', 'AboutMe', 'WorkExperience', 'GameCard', 'Sidebar', 'DAW', 'Resume']
          const element = needsThemeContext.includes(componentName)
            ? <ThemeProvider><Component {...props} /></ThemeProvider>
            : <Component {...props} />

          roots.get(component).render(element)
        }).catch(e => {
          console.error(`Failed to load component ${componentName}:`, e)
        })
        
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
