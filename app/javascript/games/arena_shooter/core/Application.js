import * as THREE from 'three';

/**
 * Main game application class that controls the game loop and high-level systems
 */
export class Application {
  constructor(options) {
    this.options = options;
    this.container = options.container;
    this.gameWorld = options.gameWorld;
    this.player = options.player;
    this.enemyManager = options.enemyManager;
    this.weaponSystem = options.weaponSystem;
    this.inputManager = options.inputManager;
    this.uiManager = options.uiManager;
    this.assetManager = options.assetManager;
    
    // Set up cross-references between systems
    this.gameWorld.player = this.player;
    this.gameWorld.weaponSystem = this.weaponSystem;
    
    // Link UI manager to player and weapon system for proper weapon display
    this.uiManager.player = this.player;
    this.player.weaponSystem = this.weaponSystem;
    
    this.isRunning = false;
    this.lastTime = 0;
    this.startTime = 0;
    this._promptedPointerLock = false;
    this.stats = null;
    
    // Initialize the renderer and scene
    this.initRenderer();
    
    // Bind methods
    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    
    // Set up event listeners
    window.addEventListener('resize', this.onWindowResize);
    
    // Initialize stats for performance monitoring if in development
    this.stats = null;
  }
  
  /**
   * Initialize the THREE.js renderer
   */
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // THREE.sRGBEncoding is deprecated, using SRGBColorSpace instead
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    this.container.appendChild(this.renderer.domElement);
  }
  
  /**
   * Start the game loop
   */
  start() {
    if (!this.isRunning) {
      // Ensure no conflicting game state
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock();
          console.log("Cleared existing pointer lock before starting game");
        } catch (e) {
          console.warn("Could not clear existing pointer lock:", e);
        }
      }
      
      console.log("Game starting sequence initiated");
      
      // Hide any ESC menu that might be visible
      const escMenu = document.getElementById('esc-menu');
      if (escMenu) {
        escMenu.style.display = 'none';
      }
      
      // Set game state to running
      this.isRunning = true;
      this.lastTime = performance.now();
      this.startTime = performance.now();
      this._promptedPointerLock = false;
      
      // Start game loop
      requestAnimationFrame(this.animate);
      
      // Make sure we don't have any events queued that might trigger the ESC menu
      // Use a longer delay to ensure DOM has settled
      setTimeout(() => {
        console.log("Delayed game start actions executing");
        
        // Check if the game is still supposed to be running 
        // (this prevents issues if the user quickly switched levels)
        if (!this.isRunning) {
          console.log("Game no longer running, aborting delayed start actions");
          return;
        }
        
        // Request pointer lock to enable camera controls
        if (this.inputManager) {
          console.log("Requesting pointer lock from Application start");
          this.inputManager.requestPointerLock();
        }
        
        // Ensure weapon is equipped and visible
        if (this.weaponSystem) {
          // Force re-equip the current weapon to ensure model is visible
          const currentIndex = this.weaponSystem.currentWeaponIndex || 0;
          this.weaponSystem.equipWeapon(currentIndex);
          console.log("Equipped starting weapon at index:", currentIndex);
        }
        
        // Start enemy spawning - do this last to ensure player is ready
        console.log("Starting enemy spawning");
        this.enemyManager.startSpawning();
        
        // Add a final check after everything should be settled
        setTimeout(() => {
          if (this.isRunning && this.inputManager && !this.inputManager.pointerLocked) {
            console.log("Final pointer lock check: still not locked, requesting again");
            this.inputManager.requestPointerLock();
          }
        }, 500);
        
      }, 400); // Longer delay for better reliability
      
      console.log("Game started - WASD movement and camera controls active");
    }
  }
  
  /**
   * Stop the game loop
   */
  stop() {
    this.isRunning = false;
    this.enemyManager.stopSpawning();
  }
  
  /**
   * Main animation/game loop
   */
  animate(time) {
    if (!this.isRunning) return;
    
    requestAnimationFrame(this.animate);
    
    // Calculate delta time
    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    // Clamp deltaTime to prevent large jumps
    const clampedDelta = Math.min(deltaTime, 0.1);
    
    // Log frame rate occasionally
    if (Math.random() < 0.01) { // Log every ~100 frames
      console.log(`FPS: ${(1 / clampedDelta).toFixed(1)}, Delta: ${(clampedDelta * 1000).toFixed(2)}ms`);
      console.log(`Player position: ${this.player.camera.position.x.toFixed(2)}, ${this.player.camera.position.y.toFixed(2)}, ${this.player.camera.position.z.toFixed(2)}`);
      console.log(`Pointer locked: ${this.inputManager.pointerLocked}`);
    }
    
    // After 5 seconds, request pointer lock if not already locked
    if (time - this.startTime > 5000 && !this.inputManager.pointerLocked && !this._promptedPointerLock) {
      console.log("Prompting for pointer lock after 5 seconds");
      this._promptedPointerLock = true;
      
      // Show a UI message to click for controls
      if (this.uiManager) {
        this.uiManager.showMessage("Click anywhere to enable mouse controls", 3000);
      }
    }
    
    // Update all game systems
    this.inputManager.update(clampedDelta);
    this.player.update(clampedDelta);
    this.enemyManager.update(clampedDelta);
    
    // Check if player is shooting and fire weapon if needed
    if (this.inputManager.isShooting && this.weaponSystem) {
      this.weaponSystem.fireWeapon();
      console.log('Firing weapon');
    }
    
    // Check if player is reloading
    if (this.inputManager.isReloading && this.weaponSystem) {
      this.weaponSystem.reloadWeapon();
      this.inputManager.isReloading = false; // Reset reload flag after handling
      console.log('Reloading weapon');
    }
    
    // Handle weapon switching
    if (this.inputManager.weaponSwitchRequested && this.weaponSystem) {
      this.weaponSystem.equipWeapon(this.inputManager.weaponSlot);
      this.inputManager.weaponSwitchRequested = false; // Reset flag after handling
      console.log(`Switching to weapon slot ${this.inputManager.weaponSlot + 1}`);
    }
    
    this.weaponSystem.update(clampedDelta);
    this.gameWorld.update(clampedDelta);
    this.uiManager.update(clampedDelta);
    
    // Render the scene with the player's camera
    this.renderer.render(this.gameWorld.scene, this.player.camera);
    
    // Update stats if available
    if (this.stats) {
      this.stats.update();
    }
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Update player camera aspect ratio
    this.player.camera.aspect = width / height;
    this.player.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(width, height);
  }
  
  /**
   * Clean up resources when the application is destroyed
   */
  dispose() {
    try {
      console.log('Disposing application resources');
      window.removeEventListener('resize', this.onWindowResize);
      this.stop();
      
      // Dispose of THREE.js renderer
      if (this.renderer) {
        this.renderer.dispose();
        if (this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
      }
      
      // Clean up other systems
      if (this.inputManager) this.inputManager.dispose();
      if (this.gameWorld) this.gameWorld.dispose();
      if (this.player) this.player.dispose();
      if (this.enemyManager) this.enemyManager.stopSpawning();
      if (this.weaponSystem) this.weaponSystem.dispose();
      
      console.log('Application resources disposed');
    } catch (e) {
      console.warn('Error during application disposal:', e);
    }
  }
}