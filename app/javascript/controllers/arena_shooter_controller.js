import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="arena-shooter"
export default class extends Controller {
  connect() {
    console.log("Arena Shooter controller connected - WASD & Mouse Movement Fix")
    
    // Ensure console logs are visible
    console.debug = console.log;
    
    // Create a simple input debugging overlay to verify event capture
    this.createInputDebugOverlay();
    
    // Set up event listener for input at document level
    // These are just for debugging, the actual game uses its own input handlers
    document.addEventListener('keydown', (e) => {
      console.log(`Input detected: ${e.code}`);
      this.showInputDebug(`Key: ${e.code}`);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (e.movementX || e.movementY) {
        this.showInputDebug(`Mouse: x:${e.movementX}, y:${e.movementY}`);
      }
    });
    
    // Prevent default behavior on right-click to avoid context menu in game
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('#arena-shooter-container')) {
        e.preventDefault();
      }
    });
    
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
  
  // Create a dedicated overlay for input debugging
  createInputDebugOverlay() {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'input-debug-overlay';
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '60px';
    debugDiv.style.right = '10px';
    debugDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugDiv.style.color = 'yellow';
    debugDiv.style.padding = '8px';
    debugDiv.style.borderRadius = '4px';
    debugDiv.style.fontFamily = 'monospace';
    debugDiv.style.fontSize = '11px';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.pointerEvents = 'none';
    debugDiv.style.maxHeight = '150px';
    debugDiv.style.overflow = 'hidden';
    debugDiv.style.maxWidth = '300px';
    document.body.appendChild(debugDiv);
    
    this.inputDebugDiv = debugDiv;
  }
  
  // Add an input debug message
  showInputDebug(message) {
    if (!this.inputDebugDiv) return;
    
    // Add timestamp
    const time = new Date().toISOString().substr(11, 8);
    const msgElement = document.createElement('div');
    msgElement.textContent = `[${time}] ${message}`;
    this.inputDebugDiv.appendChild(msgElement);
    
    // Keep only last 6 messages
    while (this.inputDebugDiv.children.length > 6) {
      this.inputDebugDiv.removeChild(this.inputDebugDiv.firstChild);
    }
  }
  
  disconnect() {
    // Clean up game resources when the controller is disconnected
    console.log("Arena Shooter controller disconnected")
    
    // The game's dispose method will be called when the page is navigated away from
    window.dispatchEvent(new CustomEvent('arena-shooter:dispose'))
  }
}