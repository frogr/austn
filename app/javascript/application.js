import "@hotwired/turbo-rails"
import "./controllers"
import React from 'react'
import { createRoot } from 'react-dom/client'

// Lazy-load components to keep the main bundle small.
// Each component becomes its own chunk and only loads when present in the DOM.
const COMPONENT_LOADERS = {
  Chat: () => import('./components/Chat'),
  DAW: () => import('./components/daw/DAW'),
  ClaudeCorner: () => import('./components/ClaudeCorner'),
  ReviewApp: () => import('./components/review/ReviewApp')
}

// Store our roots so we can track which elements have been initialized
const roots = new Map()

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

          roots.get(component).render(<Component {...props} />)
        }).catch(e => {
          console.error(`Failed to load component ${componentName}:`, e)
        })

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
