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
    
    // Bind event handlers
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    
    // Add event listeners
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    
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
      const startScreen = document.getElementById('start-screen');
      if (startScreen) startScreen.style.display = 'flex';
      console.log('Pointer lock released');
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
  
  onPointerLockChange() {
    this.pointerLocked = document.pointerLockElement !== null;
  }
  
  requestPointerLock() {
    if (this.controls && !this.pointerLocked) {
      console.log('Requesting pointer lock');
      this.controls.lock();
    }
  }
  
  update(deltaTime) {
    // Nothing to do here, we just maintain state
  }
  
  dispose() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    console.log('InputManager disposed');
  }
}