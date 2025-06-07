import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { World, PhysicsSystem, RenderSystem, HealthSystem } from '../ecs/index.js';

/**
 * GameEngine is the main class that coordinates the game systems
 */
export class GameEngine {
  constructor() {
    // Core properties
    this.world = null;
    this.systems = [];
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    this.isRunning = false;
    this.debugMode = false;
    
    // Scene settings
    this.sceneSettings = {
      gravity: -9.8,
      fogColor: 0x000000,
      fogDensity: 0.01,
      ambientLightColor: 0x404040,
      ambientLightIntensity: 0.5
    };
    
    // Input state
    this.inputState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      sprint: false,
      primaryFire: false,
      secondaryFire: false,
      reload: false,
      weaponSwitch: null
    };
    
    // Timing
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this.fpsCounter = {
      frameCount: 0,
      lastSecond: 0,
      fps: 0
    };
    
    // Event callbacks
    this.onInitialized = null;
    this.onUpdate = null;
    this.onRender = null;
    this.onResize = this.handleResize.bind(this);
    
    // Add window resize listener
    window.addEventListener('resize', this.onResize);
  }
  
  /**
   * Initialize the game engine
   * @param {HTMLElement} container - Container element for the renderer
   * @param {Object} options - Engine options
   * @returns {Promise<GameEngine>} - This engine instance
   */
  async initialize(container, options = {}) {
    // Store options
    this.options = {
      width: options.width || container.clientWidth,
      height: options.height || container.clientHeight,
      antialias: options.antialias !== undefined ? options.antialias : true,
      shadows: options.shadows !== undefined ? options.shadows : true,
      debugMode: options.debugMode || false,
      ...options
    };
    
    this.debugMode = this.options.debugMode;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.options.antialias,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.options.width, this.options.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Configure renderer
    if (this.options.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    // Add renderer to container
    container.appendChild(this.renderer.domElement);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75, 
      this.options.width / this.options.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);
    
    // Set up pointer lock controls
    // Use the container instead of document.body for better scoping
    this.controls = new PointerLockControls(this.camera, container);
    
    // Create the ECS world
    this.world = new World();
    
    // Set up scene
    this.setupScene();
    
    // Register core systems
    this.registerCoreSystems();
    
    // Set up input handlers
    this.setupInputHandlers();
    
    // Initialize the clock
    this.clock.start();
    this.lastFrameTime = performance.now();
    
    // Call onInitialized callback if defined
    if (typeof this.onInitialized === 'function') {
      this.onInitialized();
    }
    
    return this;
  }
  
  /**
   * Set up the scene
   */
  setupScene() {
    // Configure scene fog
    this.world.scene.fog = new THREE.FogExp2(
      this.sceneSettings.fogColor,
      this.sceneSettings.fogDensity
    );
    
    // Add background color
    this.world.scene.background = new THREE.Color(0x000000);
  }
  
  /**
   * Register core systems
   */
  registerCoreSystems() {
    // Physics system
    const physicsSystem = new PhysicsSystem();
    physicsSystem.gravity.set(0, this.sceneSettings.gravity, 0);
    this.world.registerSystem(physicsSystem);
    
    // Render system
    const renderSystem = new RenderSystem(this.renderer, this.camera);
    this.world.registerSystem(renderSystem);
    
    // Health system
    const healthSystem = new HealthSystem();
    this.world.registerSystem(healthSystem);
    
    // Store references to systems
    this.systems = {
      physics: physicsSystem,
      render: renderSystem,
      health: healthSystem
    };
  }
  
  /**
   * Set up input handlers
   */
  setupInputHandlers() {
    // Keyboard event handlers - make these bound methods for removal
    this.keyDownHandler = this.handleKeyDown.bind(this);
    this.keyUpHandler = this.handleKeyUp.bind(this);
    this.mouseDownHandler = this.handleMouseDown.bind(this);
    this.mouseUpHandler = this.handleMouseUp.bind(this);
    this.pointerLockChangeHandler = this.handlePointerLockChange.bind(this);
    
    // Add event listeners
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
    document.addEventListener('mousedown', this.mouseDownHandler);
    document.addEventListener('mouseup', this.mouseUpHandler);
    document.addEventListener('pointerlockchange', this.pointerLockChangeHandler);
    
    console.log('Input handlers set up');
  }
  
  /**
   * Handle key down events
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    // Log the key press
    console.log('Key down:', event.code);
    
    // Update input state based on key
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputState.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputState.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputState.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputState.right = true;
        break;
      case 'Space':
        this.inputState.jump = true;
        break;
      case 'ShiftLeft':
        this.inputState.sprint = true;
        break;
      case 'KeyR':
        this.inputState.reload = true;
        break;
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
        // Extract weapon index from key (1-5 mapped to 0-4)
        this.inputState.weaponSwitch = parseInt(event.code.charAt(5)) - 1;
        break;
      case 'Escape':
        // Don't handle escape here - let the PlayingState handle it
        break;
    }
    
    // Log the input state
    console.log('Input state after key down:', JSON.stringify(this.inputState));
  }
  
  /**
   * Handle key up events
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyUp(event) {
    // Log the key release
    console.log('Key up:', event.code);
    
    // Update input state based on key
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputState.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputState.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputState.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputState.right = false;
        break;
      case 'Space':
        this.inputState.jump = false;
        break;
      case 'ShiftLeft':
        this.inputState.sprint = false;
        break;
      case 'KeyR':
        this.inputState.reload = false;
        break;
    }
    
    // Reset weapon switch after processing
    if (event.code.startsWith('Digit')) {
      this.inputState.weaponSwitch = null;
    }
    
    // Log the input state
    console.log('Input state after key up:', JSON.stringify(this.inputState));
  }
  
  /**
   * Handle mouse down events
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseDown(event) {
    // Handle mouse buttons
    switch (event.button) {
      case 0: // Left mouse button
        this.inputState.primaryFire = true;
        break;
      case 2: // Right mouse button
        this.inputState.secondaryFire = true;
        break;
    }
    
    // Don't automatically request pointer lock here
    // This should only be done in direct response to a user gesture like a button click
  }
  
  /**
   * Handle mouse up events
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseUp(event) {
    // Handle mouse buttons
    switch (event.button) {
      case 0: // Left mouse button
        this.inputState.primaryFire = false;
        break;
      case 2: // Right mouse button
        this.inputState.secondaryFire = false;
        break;
    }
  }
  
  /**
   * Handle pointer lock change
   */
  handlePointerLockChange() {
    const canvas = this.renderer?.domElement;
    if (document.pointerLockElement === canvas) {
      // Pointer is locked on our canvas
      console.log('Pointer is locked');
      // Don't automatically resume or transition states - let the state machine handle this
    } else {
      // Pointer is unlocked
      console.log('Pointer is unlocked');
      // Don't automatically pause - let the state machine handle this
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.renderer || !this.camera) return;
    
    // Update sizes
    const container = this.renderer.domElement.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Update camera aspect ratio
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(width, height);
  }
  
  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }
  
  /**
   * Pause the game
   */
  pause() {
    this.isRunning = false;
  }
  
  /**
   * Resume the game
   */
  resume() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }
  
  /**
   * Stop the game and clean up resources
   */
  stop() {
    this.isRunning = false;
    
    // Clean up resources
    if (this.world) {
      this.world.dispose();
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.onResize);
    
    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
  
  /**
   * Main animation loop
   */
  animate() {
    if (!this.isRunning) return;
    
    // Request next frame
    requestAnimationFrame(() => this.animate());
    
    // Calculate delta time
    const now = performance.now();
    this.deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1); // Cap at 0.1s
    this.lastFrameTime = now;
    
    // Process input state and move the camera directly
    this.processInputForCamera();
    
    // Update FPS counter
    this.updateFPS(now);
    
    // Call custom update callback
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(this.deltaTime);
    }
    
    // Update world systems
    this.world.update(this.deltaTime);
    
    // Call custom render callback
    if (typeof this.onRender === 'function') {
      this.onRender();
    }
  }
  
  /**
   * Process input state to directly move the camera
   */
  processInputForCamera() {
    if (!this.controls || !this.camera) return;
    
    // Calculate movement speed based on delta time
    const speedMultiplier = this.deltaTime * 5.0;
    const sprintMultiplier = this.inputState.sprint ? 2.0 : 1.0;
    
    // Direction vector
    const direction = new THREE.Vector3();
    
    // Get camera direction
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Keep movement horizontal
    cameraDirection.normalize();
    
    // Calculate right vector (perpendicular to camera direction)
    const right = new THREE.Vector3().crossVectors(
      new THREE.Vector3(0, 1, 0), 
      cameraDirection
    ).normalize();
    
    // Apply forward/backward movement
    if (this.inputState.forward) {
      direction.add(cameraDirection);
    }
    if (this.inputState.backward) {
      direction.sub(cameraDirection);
    }
    
    // Apply left/right movement
    if (this.inputState.left) {
      direction.sub(right);
    }
    if (this.inputState.right) {
      direction.add(right);
    }
    
    // Normalize direction vector if we're moving
    if (direction.lengthSq() > 0) {
      direction.normalize();
      
      // Apply movement speed
      const speed = speedMultiplier * sprintMultiplier;
      
      // Move the camera using the controls
      this.controls.moveRight(direction.x * speed);
      this.controls.moveForward(direction.z * speed);
      
      // Log movement every 30 frames to avoid console spam
      if (Math.random() < 0.03) {
        console.log('Moving camera: direction=', 
                  direction.x.toFixed(2), 
                  direction.z.toFixed(2), 
                  'speed=', speed.toFixed(2));
      }
    }
    
    // Jump logic would go here, but we'll skip it for simplicity
  }
  
  /**
   * Update FPS counter
   * @param {number} now - Current timestamp
   */
  updateFPS(now) {
    // Increment frame count
    this.fpsCounter.frameCount++;
    
    // Calculate FPS every second
    if (now - this.fpsCounter.lastSecond >= 1000) {
      this.fpsCounter.fps = this.fpsCounter.frameCount;
      this.fpsCounter.frameCount = 0;
      this.fpsCounter.lastSecond = now;
    }
  }
  
  /**
   * Get current FPS
   * @returns {number} - Current FPS
   */
  getFPS() {
    return this.fpsCounter.fps;
  }
}