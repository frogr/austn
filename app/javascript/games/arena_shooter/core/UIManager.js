/**
 * Manages the game's user interface
 */
export class UIManager {
  constructor() {
    // UI elements
    this.healthDisplay = document.getElementById('health-value');
    this.ammoDisplay = document.getElementById('ammo-value');
    this.maxAmmoDisplay = document.getElementById('max-ammo-value');
    this.crosshair = document.getElementById('crosshair');
    this.loadingScreen = document.getElementById('loading-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.startScreen = document.getElementById('start-screen');
    this.startButton = document.getElementById('start-button');
    
    // Ensure game over screen is hidden at initialization
    if (this.gameOverScreen) {
      this.gameOverScreen.classList.add('hidden');
    }
    
    // Setup start button event listener
    if (this.startButton) {
      this.startButton.addEventListener('click', () => {
        this.hideStartScreen();
        this.emit('gameStart');
      });
    }
    
    // Game state
    this.score = 0;
    
    // Event listeners
    this.eventListeners = new Map();
  }
  
  /**
   * Update UI elements
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // UI updates happen in response to game events
  }
  
  /**
   * Update health display
   * @param {number} health - Current health value
   */
  updateHealth(health) {
    if (this.healthDisplay) {
      this.healthDisplay.textContent = Math.round(health);
      
      // Apply color based on health status
      if (health < 30) {
        this.healthDisplay.classList.add('text-red-500');
      } else if (health < 70) {
        this.healthDisplay.classList.add('text-yellow-500');
        this.healthDisplay.classList.remove('text-red-500');
      } else {
        this.healthDisplay.classList.remove('text-yellow-500');
        this.healthDisplay.classList.remove('text-red-500');
      }
    }
  }
  
  /**
   * Update ammo display
   * @param {number} ammo - Current ammo count
   * @param {number} maxAmmo - Maximum ammo capacity
   */
  updateAmmo(ammo, maxAmmo) {
    if (this.ammoDisplay && this.maxAmmoDisplay) {
      this.ammoDisplay.textContent = ammo;
      this.maxAmmoDisplay.textContent = maxAmmo;
      
      // Apply color when low on ammo
      if (ammo === 0) {
        this.ammoDisplay.classList.add('text-red-500');
      } else if (ammo < maxAmmo * 0.25) {
        this.ammoDisplay.classList.add('text-yellow-500');
        this.ammoDisplay.classList.remove('text-red-500');
      } else {
        this.ammoDisplay.classList.remove('text-yellow-500');
        this.ammoDisplay.classList.remove('text-red-500');
      }
    }
  }
  
  /**
   * Update score
   * @param {number} score - Current score
   */
  updateScore(score) {
    this.score = score;
  }
  
  /**
   * Show reloading indicator
   * @param {boolean} isReloading - Whether the player is reloading
   */
  showReloading(isReloading) {
    if (this.ammoDisplay) {
      if (isReloading) {
        this.ammoDisplay.textContent = '...';
      }
    }
  }
  
  /**
   * Show hit marker when player hits an enemy
   */
  showHitMarker() {
    if (this.crosshair) {
      // Add hit marker effect (simple animation)
      this.crosshair.classList.add('hit');
      
      // Remove hit marker effect after a short time
      setTimeout(() => {
        this.crosshair.classList.remove('hit');
      }, 100);
    }
  }
  
  /**
   * Display damage indicator when player is hit
   * @param {number} direction - Direction of the damage (in radians)
   */
  showDamageIndicator(direction) {
    // Create damage indicator element
    const indicator = document.createElement('div');
    indicator.className = 'damage-indicator';
    
    // Position the indicator based on the direction
    const angle = (direction * (180 / Math.PI)) % 360;
    indicator.style.transform = `rotate(${angle}deg)`;
    
    // Add to the UI
    document.getElementById('game-ui').appendChild(indicator);
    
    // Remove after animation completes
    setTimeout(() => {
      indicator.remove();
    }, 1000);
  }
  
  /**
   * Show game over screen
   */
  showGameOver() {
    if (this.gameOverScreen) {
      document.getElementById('final-score').textContent = `Score: ${this.score}`;
      this.gameOverScreen.classList.remove('hidden');
      
      // Emit game over event
      this.emit('gameOver', this.score);
    }
  }
  
  /**
   * Hide game over screen
   */
  hideGameOver() {
    if (this.gameOverScreen) {
      this.gameOverScreen.classList.add('hidden');
    }
  }
  
  /**
   * Hide start screen
   */
  hideStartScreen() {
    if (this.startScreen) {
      this.startScreen.classList.add('hidden');
    }
  }
  
  /**
   * Show start screen
   */
  showStartScreen() {
    if (this.startScreen) {
      this.startScreen.classList.remove('hidden');
    }
  }
  
  /**
   * Add event listener for UI events
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(callback);
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
  
  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emit(event, ...args) {
    if (!this.eventListeners.has(event)) return;
    
    const listeners = this.eventListeners.get(event);
    listeners.forEach(callback => callback(...args));
  }
  
  /**
   * Add CSS styles for UI elements
   */
  addStyles() {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      .damage-indicator {
        position: fixed;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        pointer-events: none;
        background: radial-gradient(transparent 0%, transparent 70%, rgba(255,0,0,0.3) 100%);
        transform-origin: center;
        animation: damage-pulse 1s ease-out;
        opacity: 0;
      }
      
      @keyframes damage-pulse {
        0% { transform: scale(0); opacity: 0.8; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      
      .hit::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.8);
        transform: translate(-50%, -50%);
        animation: hit-pulse 0.1s ease-out;
      }
      
      @keyframes hit-pulse {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
      }
    `;
    
    // Add to document head
    document.head.appendChild(style);
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Clear all event listeners
    this.eventListeners.clear();
  }
}