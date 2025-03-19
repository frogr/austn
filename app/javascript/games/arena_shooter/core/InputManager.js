/**
 * Manages keyboard and mouse input for the game
 */
export class InputManager {
  constructor() {
    // Input state
    this.keys = new Map();
    this.mousePosition = { x: 0, y: 0 };
    this.mouseButtons = new Map();
    this.mouseMovement = { x: 0, y: 0 };
    this.frameDeltaX = 0;
    this.frameDeltaY = 0;
    this.pointerLocked = false;
    
    // Movement state (WASD)
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.jump = false;
    this.sprint = false;
    this.crouch = false;
    this.reload = false;
    
    // Event bindings
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  /**
   * Initialize all input event listeners
   */
  initEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    
    // Mouse events
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    
    // Pointer lock events
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }
  
  /**
   * Update input state
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Store current mouse movement for this frame
    this.frameDeltaX = this.mouseMovement.x;
    this.frameDeltaY = this.mouseMovement.y;
    
    // Reset mouse movement each frame since it's delta-based
    this.mouseMovement = { x: 0, y: 0 };
  }
  
  /**
   * Handle key down events
   * @param {KeyboardEvent} event - The keyboard event
   */
  onKeyDown(event) {
    // Prevent default browser actions for WASD keys and number keys
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(event.code)) {
      event.preventDefault();
    }
    
    // Set key state
    this.keys.set(event.code, true);
    
    // Log key down events for debugging
    console.debug(`Key down: ${event.code}`);
    
    // Update movement state
    this.updateMovementState();
    
    // Special handling for specific keys
    switch (event.code) {
      case 'KeyR':
        this.reload = true;
        break;
    }
  }
  
  /**
   * Handle key up events
   * @param {KeyboardEvent} event - The keyboard event
   */
  onKeyUp(event) {
    this.keys.set(event.code, false);
    
    // Update movement state
    this.updateMovementState();
    
    // Special handling for specific keys
    switch (event.code) {
      case 'KeyR':
        this.reload = false;
        break;
    }
  }
  
  /**
   * Update movement state based on current key states
   */
  updateMovementState() {
    // Get key states with debug logging for WASD keys
    const wKey = this.keys.get('KeyW') || false;
    const aKey = this.keys.get('KeyA') || false;
    const sKey = this.keys.get('KeyS') || false;
    const dKey = this.keys.get('KeyD') || false;
    
    // Update movement states
    this.moveForward = wKey;
    this.moveBackward = sKey;
    this.moveLeft = aKey;
    this.moveRight = dKey;
    this.jump = this.keys.get('Space') || false;
    this.sprint = this.keys.get('ShiftLeft') || false;
    this.crouch = this.keys.get('ControlLeft') || false;
    
    // Debug log movement state
    if (wKey || aKey || sKey || dKey) {
      const activeKeys = [];
      if (wKey) activeKeys.push('W');
      if (aKey) activeKeys.push('A');
      if (sKey) activeKeys.push('S');
      if (dKey) activeKeys.push('D');
      console.debug(`Movement keys active: ${activeKeys.join(', ')}`);
    }
  }
  
  /**
   * Handle mouse move events
   * @param {MouseEvent} event - The mouse event
   */
  onMouseMove(event) {
    // Store mouse position
    this.mousePosition = {
      x: event.clientX,
      y: event.clientY
    };
    
    // Process mouse movement for camera control only when pointer is locked
    if (this.pointerLocked) {
      // Get the movement from the event
      const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      
      // Add to the accumulated movement for this frame
      this.mouseMovement.x += movementX;
      this.mouseMovement.y += movementY;
      
      // Log movement for debugging
      if (Math.abs(movementX) > 0 || Math.abs(movementY) > 0) {
        console.debug(`Mouse movement: x=${movementX}, y=${movementY}`);
      }
    }
  }
  
  /**
   * Handle mouse down events
   * @param {MouseEvent} event - The mouse event
   */
  onMouseDown(event) {
    this.mouseButtons.set(event.button, true);
    
    // Request pointer lock on left click if not already locked
    if (event.button === 0 && !this.pointerLocked) {
      this.requestPointerLock();
    }
  }
  
  /**
   * Handle mouse up events
   * @param {MouseEvent} event - The mouse event
   */
  onMouseUp(event) {
    this.mouseButtons.set(event.button, false);
  }
  
  /**
   * Handle pointer lock change events
   */
  onPointerLockChange() {
    const wasLocked = this.pointerLocked;
    this.pointerLocked = document.pointerLockElement !== null;
    
    // Log pointer lock state changes
    if (wasLocked !== this.pointerLocked) {
      console.log(`Pointer lock ${this.pointerLocked ? 'acquired' : 'released'}`);
    }
    
    // Reset key states when pointer lock is released
    // This prevents keys from getting "stuck" if released while pointer is unlocked
    if (!this.pointerLocked) {
      this.keys = new Map();
      this.mouseButtons = new Map();
      this.updateMovementState();
    }
  }
  
  /**
   * Check if a key is pressed
   * @param {string} code - The key code
   * @returns {boolean} - Whether the key is pressed
   */
  isKeyPressed(code) {
    return this.keys.get(code) || false;
  }
  
  /**
   * Check if a mouse button is pressed
   * @param {number} button - The mouse button (0 = left, 1 = middle, 2 = right)
   * @returns {boolean} - Whether the button is pressed
   */
  isMouseButtonPressed(button) {
    return this.mouseButtons.get(button) || false;
  }
  
  /**
   * Request pointer lock for the document
   */
  requestPointerLock() {
    if (!this.pointerLocked) {
      try {
        // Try to request pointer lock on the canvas or container element first
        const gameContainer = document.getElementById('arena-shooter-container');
        if (gameContainer) {
          gameContainer.requestPointerLock();
        } else {
          // Fallback to document.body
          document.body.requestPointerLock();
        }
        console.log('Requesting pointer lock');
      } catch (error) {
        console.error('Failed to request pointer lock:', error);
      }
    }
  }
  
  /**
   * Exit pointer lock
   */
  exitPointerLock() {
    if (this.pointerLocked) {
      document.exitPointerLock();
    }
  }
  
  /**
   * Remove all event listeners
   */
  dispose() {
    // Remove keyboard events
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    
    // Remove mouse events
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    
    // Remove pointer lock events
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    
    // Exit pointer lock if active
    this.exitPointerLock();
  }
}