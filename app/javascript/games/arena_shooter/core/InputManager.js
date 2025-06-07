// InputManager.js
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class InputManager {
  constructor() {
    console.log('InputManager initializing with PointerLockControls');
    
    // Camera will be set later when player is created
    this.camera = null;
    this.controls = null;
    
    // Movement flags
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.pointerLocked = false;
    
    // Shooting and reloading flags
    this.isShooting = false;
    this.isReloading = false;
    
    // Weapon switching flags (1-5 keys)
    this.weaponSwitchRequested = false;
    this.weaponSlot = 0; // Default to first weapon
    
    // Bind event handlers
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    
    // Add event listeners
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    
    console.log('InputManager initialized - events attached');
  }

  handleClick() {
    // Forward to requestPointerLock method
    this.requestPointerLock();
  }
  
  // Initialize pointer lock controls after camera is created
  initControls(camera, domElement) {
    this.camera = camera;
    this.controls = new PointerLockControls(camera, domElement || document.body);
    
    // Setup pointer lock events
    this.controls.addEventListener('lock', () => {
      this.pointerLocked = true;
      const startScreen = document.getElementById('start-screen');
      if (startScreen) startScreen.style.display = 'none';
      console.log('Pointer lock acquired');
    });
    
    this.controls.addEventListener('unlock', () => {
      this.pointerLocked = false;
      console.log('Pointer lock released');
      // Don't auto-pause here - let the user control pausing with ESC
    });
    
    return this.controls;
  }
  
  onKeyDown(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        if (this.canJump) {
          this.canJump = false;
        }
        break;
      case 'KeyR':
        // Trigger reload when R key is pressed
        this.isReloading = true;
        console.log('R key pressed - reloading requested');
        break;
      // Weapon switching with number keys
      case 'Digit1':
      case 'Numpad1':
        this.weaponSwitchRequested = true;
        this.weaponSlot = 0;
        console.log('Weapon 1 selected');
        break;
      case 'Digit2':
      case 'Numpad2':
        this.weaponSwitchRequested = true;
        this.weaponSlot = 1;
        console.log('Weapon 2 selected');
        break;
      case 'Digit3':
      case 'Numpad3':
        this.weaponSwitchRequested = true;
        this.weaponSlot = 2;
        console.log('Weapon 3 selected');
        break;
      case 'Digit4':
      case 'Numpad4':
        this.weaponSwitchRequested = true;
        this.weaponSlot = 3;
        console.log('Weapon 4 selected');
        break;
      case 'Digit5':
      case 'Numpad5':
        this.weaponSwitchRequested = true;
        this.weaponSlot = 4;
        console.log('Weapon 5 selected');
        break;
    }
  }
  
  onKeyUp(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }
  
  // Track last time pointer lock was changed to prevent loops
  lastPointerLockChange = Date.now() - 1000;

  onPointerLockChange() {
    const now = Date.now();
    const wasLocked = this.pointerLocked;
    this.pointerLocked = document.pointerLockElement !== null;
    
    // Debounce pointer lock changes to prevent rapid toggling
    if (now - this.lastPointerLockChange < 300) {
      console.log('Ignoring rapid pointer lock change');
      return;
    }
    this.lastPointerLockChange = now;
    
    console.log(`Pointer lock changed: ${wasLocked ? 'locked' : 'unlocked'} -> ${this.pointerLocked ? 'locked' : 'unlocked'}`);
    
    // If we gained pointer lock, make sure the game is running
    if (!wasLocked && this.pointerLocked) {
      // Hide ESC menu if visible
      const escMenu = document.getElementById('esc-menu');
      if (escMenu && escMenu.style.display === 'flex') {
        escMenu.style.display = 'none';
      }
      
      // Resume game if it exists
      if (window.currentApp) {
        window.currentApp.isRunning = true;
        console.log('Pointer lock gained: resuming game');
      }
    }
    
    // If pointer lock was lost unexpectedly and not due to ESC key
    if (wasLocked && !this.pointerLocked) {
      // Don't auto-pause or show ESC menu when pointer lock is lost
      // This was causing issues with resume functionality
      console.log('Pointer lock lost - no auto-pause');
    }
  }
  
  onMouseDown(event) {
    // Only handle left mouse button (button 0)
    if (event.button === 0 && this.pointerLocked) {
      this.isShooting = true;
      console.log('Mouse down - shooting started');
    }
  }
  
  onMouseUp(event) {
    // Only handle left mouse button (button 0)
    if (event.button === 0) {
      this.isShooting = false;
      console.log('Mouse up - shooting stopped');
    }
  }
  
  requestPointerLock() {
    if (!this.controls) {
      console.warn('Cannot request pointer lock: controls not initialized');
      return;
    }
    
    console.log('Requesting pointer lock');
    
    // Skip redundant locking
    if (document.pointerLockElement === this.controls.domElement) {
      console.log('Pointer is already locked to our element');
      return;
    }
    
    // Make sure any ESC menu is hidden
    const escMenu = document.getElementById('esc-menu');
    if (escMenu && escMenu.style.display === 'flex') {
      escMenu.style.display = 'none';
    }
    
    // First ensure we're not already locked to something else
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
        console.log('Exited existing pointer lock');
        
        // Small delay before requesting again
        setTimeout(() => {
          try {
            this.controls.lock();
            console.log('Requested pointer lock after exiting previous');
          } catch (e) {
            console.warn('Error requesting pointer lock after exit:', e);
          }
        }, 100); // Longer delay for better reliability
      } catch (e) {
        console.warn('Error exiting pointer lock:', e);
        // Try direct lock anyway
        try {
          this.controls.lock();
        } catch (e2) {
          console.warn('Failed to directly request lock:', e2);
        }
      }
    } else {
      // Not locked, so request lock directly
      try {
        this.controls.lock();
        console.log('Directly requested pointer lock');
      } catch (e) {
        console.warn('Error directly requesting pointer lock:', e);
      }
    }
    
    // Add a more robust fallback check in case lock fails
    setTimeout(() => {
      if (!this.pointerLocked && this.controls) {
        console.log('Pointer lock failed on first attempt, trying again...');
        try {
          this.controls.lock();
          console.log('Retry pointer lock requested');
        } catch (e) {
          console.warn('Error on retry pointer lock attempt:', e);
        }
        
        // Add a third attempt after a longer delay
        setTimeout(() => {
          if (!this.pointerLocked && this.controls) {
            console.log('Pointer lock still not acquired, final attempt...');
            try {
              this.controls.lock();
            } catch (e) {
              console.warn('Error on final pointer lock attempt:', e);
            }
          }
        }, 500);
      }
    }, 300);
  }
  
  update(deltaTime) {
    // Nothing to do here, we just maintain state
  }
  
  dispose() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    console.log('InputManager disposed');
  }
}