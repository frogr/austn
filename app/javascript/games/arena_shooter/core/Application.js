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
    
    this.isRunning = false;
    this.lastTime = 0;
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
      this.isRunning = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.animate);
      this.enemyManager.startSpawning();
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
    
    // Update all game systems
    this.inputManager.update(clampedDelta);
    this.player.update(clampedDelta);
    this.enemyManager.update(clampedDelta);
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