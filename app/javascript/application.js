import "@hotwired/turbo-rails"
import "@hotwired/stimulus"
import "./controllers"
import React from 'react'
import { createRoot } from 'react-dom/client'
import HelloWorld from './components/HelloWorld'

const COMPONENTS = {
  'HelloWorld': HelloWorld
}

// Store our roots so we can track which elements have been initialized
const roots = new Map()

document.addEventListener("turbo:load", () => {
  const reactComponents = document.querySelectorAll("[data-react-component]")
  
  reactComponents.forEach(component => {
    const componentName = component.dataset.reactComponent
    const Component = COMPONENTS[componentName]
    
    if (Component) {
      // Check if we already have a root for this container
      if (!roots.has(component)) {
        const root = createRoot(component)
        roots.set(component, root)
        root.render(<Component />)
      } else {
        // If we do have a root, just re-render it
        const existingRoot = roots.get(component)
        existingRoot.render(<Component />)
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