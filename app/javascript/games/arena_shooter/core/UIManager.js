/**
 * Manages the game's user interface
 */
export class UIManager {
  constructor() {
    console.log('UIManager initializing - FIXED VERSION');
    
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
    
    // Create weapon selector UI
    this.createWeaponSelector();
    
    // Setup start button event listener
    if (this.startButton) {
      console.log('Found start button, attaching click listener');
      this.startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        this.hideStartScreen();
        this.emit('gameStart');
      });
    } else {
      console.warn('Start button not found, will try again later');
      setTimeout(() => this.setupStartButton(), 1000);
    }
    
    // Game state
    this.score = 0;
    
    // Event listeners
    this.eventListeners = new Map();
  }
  
  /**
   * Delayed setup for start button (if not found initially)
   */
  setupStartButton() {
    this.startButton = document.getElementById('start-button');
    if (this.startButton) {
      console.log('Start button found on retry, attaching click listener');
      this.startButton.addEventListener('click', () => {
        console.log('Start button clicked');
        this.hideStartScreen();
        this.emit('gameStart');
      });
    } else {
      console.warn('Start button still not found after retry');
    }
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
   * Creates the weapon selector UI
   */
  createWeaponSelector() {
    // Find the game UI container
    const gameUI = document.getElementById('game-ui');
    if (!gameUI) {
      console.warn('Game UI element not found, cannot create weapon selector');
      return;
    }
    
    // Create weapon selector container
    const weaponSelector = document.createElement('div');
    weaponSelector.id = 'weapon-selector';
    weaponSelector.className = 'weapon-selector';
    weaponSelector.style.position = 'absolute';
    weaponSelector.style.left = '20px'; // Position on left side
    weaponSelector.style.top = '50%'; // Center vertically
    weaponSelector.style.transform = 'translateY(-50%)';
    weaponSelector.style.display = 'flex';
    weaponSelector.style.flexDirection = 'column'; // Stack weapons vertically
    weaponSelector.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    weaponSelector.style.padding = '5px';
    weaponSelector.style.borderRadius = '5px';
    weaponSelector.style.zIndex = '10';
    
    // Create weapon slots
    const weaponNames = ['Pistol', 'Assault Rifle', 'Shotgun', 'Rocket Launcher', 'Sniper Rifle'];
    
    for (let i = 0; i < 5; i++) {
      const weaponSlot = document.createElement('div');
      weaponSlot.id = `weapon-slot-${i+1}`;
      weaponSlot.className = 'weapon-slot';
      weaponSlot.style.width = '130px';
      weaponSlot.style.height = '30px';
      weaponSlot.style.margin = '3px 0';
      weaponSlot.style.display = 'flex';
      weaponSlot.style.flexDirection = 'row'; // Horizontal layout for each slot
      weaponSlot.style.alignItems = 'center';
      weaponSlot.style.justifyContent = 'flex-start'; // Left-align contents
      weaponSlot.style.border = '2px solid #555';
      weaponSlot.style.borderRadius = '3px';
      weaponSlot.style.color = 'white';
      weaponSlot.style.fontSize = '12px';
      weaponSlot.style.fontFamily = 'monospace';
      weaponSlot.style.transition = 'all 0.2s ease';
      weaponSlot.style.cursor = 'pointer';
      
      // Weapon number
      const slotNumber = document.createElement('div');
      slotNumber.textContent = `${i+1}`;
      slotNumber.style.fontSize = '14px';
      slotNumber.style.fontWeight = 'bold';
      slotNumber.style.width = '25px';
      slotNumber.style.height = '25px';
      slotNumber.style.display = 'flex';
      slotNumber.style.alignItems = 'center';
      slotNumber.style.justifyContent = 'center';
      slotNumber.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      slotNumber.style.borderRadius = '50%';
      slotNumber.style.marginLeft = '5px';
      slotNumber.style.marginRight = '10px';
      
      // Weapon name (full name)
      const slotName = document.createElement('div');
      slotName.textContent = weaponNames[i];
      slotName.style.fontSize = '11px';
      
      weaponSlot.appendChild(slotNumber);
      weaponSlot.appendChild(slotName);
      weaponSelector.appendChild(weaponSlot);
      
      // All slots start as inactive
      weaponSlot.style.backgroundColor = 'transparent';
      weaponSlot.style.borderColor = '#555';
      
      // Don't set any slot as active by default - this will be done by the WeaponSystem
    }
    
    // Add to game UI
    gameUI.appendChild(weaponSelector);
    this.weaponSelector = weaponSelector;
  }
  
  /**
   * Update the weapon selector to highlight the active weapon
   * @param {number} index - Index of the active weapon (0-based)
   * @param {string} weaponName - Name of the active weapon
   */
  updateWeaponSelector(index, weaponName) {
    if (!this.weaponSelector) {
      console.warn('Weapon selector not found');
      return;
    }
    
    // Debug logs
    console.log(`Updating weapon UI to highlight weapon index: ${index}, name: ${weaponName}`);
    
    // Reset all slots
    for (let i = 0; i < 5; i++) {
      const slot = document.getElementById(`weapon-slot-${i+1}`);
      if (slot) {
        slot.style.backgroundColor = 'transparent';
        slot.style.borderColor = '#555';
      } else {
        console.warn(`Could not find weapon slot ${i+1}`);
      }
    }
    
    // Highlight active slot
    const activeSlot = document.getElementById(`weapon-slot-${index+1}`);
    if (activeSlot) {
      activeSlot.style.backgroundColor = '#3366cc';
      activeSlot.style.borderColor = '#66aaff';
      console.log(`Highlighted weapon slot ${index+1}`);
    } else {
      console.warn(`Could not find active weapon slot ${index+1}`);
    }
    
    // Also add ammo indicator to the weapon slot
    this.updateAmmoIndicators();
  }
  
  /**
   * Update ammo indicators in the weapon selector
   */
  updateAmmoIndicators() {
    if (!this.player || !this.player.currentWeapon) return;
    
    // Add ammo count to weapon slots
    for (let i = 0; i < 5; i++) {
      const slot = document.getElementById(`weapon-slot-${i+1}`);
      if (slot) {
        // Find or create ammo indicator
        let ammoIndicator = slot.querySelector('.ammo-indicator');
        if (!ammoIndicator) {
          ammoIndicator = document.createElement('div');
          ammoIndicator.className = 'ammo-indicator';
          ammoIndicator.style.fontSize = '10px';
          ammoIndicator.style.marginLeft = 'auto';
          ammoIndicator.style.marginRight = '8px';
          ammoIndicator.style.opacity = '0.8';
          slot.appendChild(ammoIndicator);
        }
        
        // Get weapon for this slot
        if (this.player.weaponSystem && this.player.weaponSystem.weapons && this.player.weaponSystem.weapons[i]) {
          const weapon = this.player.weaponSystem.weapons[i];
          ammoIndicator.textContent = `${weapon.ammo}/${weapon.maxAmmo}`;
          
          // Color based on ammo count
          if (weapon.ammo === 0) {
            ammoIndicator.style.color = '#ff6666'; // Red when empty
          } else if (weapon.ammo < weapon.maxAmmo * 0.25) {
            ammoIndicator.style.color = '#ffcc00'; // Yellow when low
          } else {
            ammoIndicator.style.color = 'white'; // White when normal
          }
        }
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