import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="arena-shooter"
export default class extends Controller {
  connect() {
    console.log("Arena Shooter controller connected")
    
    // Load the game assets and initialize the game
    // The arena_shooter.js module will handle the actual game initialization
    import("../arena_shooter").catch(err => {
      console.error("Error loading arena shooter game:", err)
      
      // Show an error message
      const container = this.element
      container.innerHTML = `
        <div class="flex items-center justify-center h-full">
          <div class="bg-red-900 bg-opacity-80 text-white p-8 rounded-lg text-center">
            <h2 class="text-2xl font-bold mb-4">Error Loading Game</h2>
            <p class="mb-4">Sorry, there was an error loading the game engine.</p>
            <p class="text-sm text-red-300">${err.message}</p>
          </div>
        </div>
      `
    })
  }
  
  disconnect() {
    // Clean up game resources when the controller is disconnected
    console.log("Arena Shooter controller disconnected")
    
    // The game's dispose method will be called when the page is navigated away from
    window.dispatchEvent(new CustomEvent('arena-shooter:dispose'))
  }
}