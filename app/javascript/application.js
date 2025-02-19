// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "@hotwired/stimulus"
import "./controllers"
import React from 'react'
import ReactDOM from 'react-dom'

// Setup React components
document.addEventListener("turbo:load", () => {
  const reactComponents = document.querySelectorAll("[data-react-component]")
  
  reactComponents.forEach(component => {
    const componentName = component.dataset.reactComponent
    // Dynamically import the component
    import(`components/${componentName}`).then(module => {
      const Component = module.default
      ReactDOM.render(
        <Component />,
        component
      )
    })
  })
})