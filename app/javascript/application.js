import "@hotwired/turbo-rails"
import "@hotwired/stimulus"
import "./controllers"
import React from 'react'
import { createRoot } from 'react-dom/client'
import HelloWorld from './components/HelloWorld'
import Sidebar from './components/Sidebar'
import { MarkdownRenderer as MarkdownRendererNew } from './components/markdown'
import MarkdownRenderer from './components/MarkdownRenderer'
import GameCard from './components/GameCard'
import GamesGrid from './components/GamesGrid'

const COMPONENTS = {
  'HelloWorld': HelloWorld,
  'Sidebar': Sidebar,
  'MarkdownRenderer': MarkdownRenderer, // Use the direct component that's expected by blog/show.html.erb
  'MarkDownRenderer': MarkdownRendererNew, // Keep this for backward compatibility
  'GameCard': GameCard,
  'GamesGrid': GamesGrid
}

// Store our roots so we can track which elements have been initialized
const roots = new Map()

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
          } catch (e) {
            console.error(`Error parsing props for ${componentName}:`, e)
            console.log('Raw props string:', propsStr)
          }
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