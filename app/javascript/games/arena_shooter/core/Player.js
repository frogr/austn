// Player.js
import * as THREE from 'three';

export class Player {
  constructor(gameWorld, inputManager, uiManager) {
    console.log('Player initializing with PointerLockControls');
    
    this.gameWorld = gameWorld;
    this.inputManager = inputManager;
    this.uiManager = uiManager;
    
    // Create camera 
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.y = 1.7; // Eye height
    
    // Initialize PointerLockControls
    this.controls = this.inputManager.initControls(this.camera, document.getElementById('arena-shooter-container'));
    
    // Physics variables
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.prevTime = performance.now();
    
    // Player state
    this.health = 100;
    this.maxHealth = 100;
    
    console.log('Player initialized');
  }
  
  update(deltaTime) {
    // Skip if controls not initialized or not locked
    if (!this.controls || !this.inputManager.pointerLocked) {
      return;
    }
    
    // Apply friction
    this.velocity.x -= this.velocity.x * 10.0 * deltaTime;
    this.velocity.z -= this.velocity.z * 10.0 * deltaTime;
    
    // Set direction from input manager flags
    this.direction.z = Number(this.inputManager.moveForward) - Number(this.inputManager.moveBackward);
    this.direction.x = Number(this.inputManager.moveRight) - Number(this.inputManager.moveLeft);
    
    // Normalize for consistent speed in all directions
    if (this.direction.length() > 0) {
      this.direction.normalize();
    }
    
    // Apply movement based on input
    if (this.inputManager.moveForward || this.inputManager.moveBackward) {
      this.velocity.z -= this.direction.z * 400.0 * deltaTime;
    }
    
    if (this.inputManager.moveLeft || this.inputManager.moveRight) {
      this.velocity.x -= this.direction.x * 400.0 * deltaTime;
    }
    
    // Apply movement through PointerLockControls
    this.controls.moveRight(-this.velocity.x * deltaTime);
    this.controls.moveForward(-this.velocity.z * deltaTime);
    
    // Debug logging
    if (Math.random() < 0.01) { // Log ~1% of frames
      console.log(`Player velocity: ${this.velocity.x.toFixed(2)}, ${this.velocity.z.toFixed(2)}`);
      console.log(`Input states: W:${this.inputManager.moveForward}, S:${this.inputManager.moveBackward}, A:${this.inputManager.moveLeft}, D:${this.inputManager.moveRight}`);
      console.log(`Player position: ${this.camera.position.x.toFixed(2)}, ${this.camera.position.y.toFixed(2)}, ${this.camera.position.z.toFixed(2)}`);
    }
  }
  
  dispose() {
    console.log('Player disposed');
  }

  // Handle weapon equipping
  setWeapon(weapon) {
    this.currentWeapon = weapon;
    
    // Update UI if available
    if (this.uiManager) {
      this.uiManager.updateAmmo(weapon.ammo, weapon.maxAmmo);
      
      // Update weapon selector if implemented
      if (typeof this.uiManager.updateWeaponSelector === 'function') {
        // Use explicit index from the weapon
        console.log(`Player.setWeapon: Updating UI for weapon index ${weapon.index}, name: ${weapon.name}`);
        this.uiManager.updateWeaponSelector(weapon.index, weapon.name);
      }
    } else {
      console.warn('No UI manager available in Player.setWeapon');
    }
    
    console.log(`Equipped weapon: ${weapon.name}`);
  }

  // Handle weapon reloading
  startReload() {
    // Skip if already reloading or no weapon
    if (this.isReloading || !this.currentWeapon) return;
    
    // Skip if weapon is already full
    if (this.currentWeapon.ammo >= this.currentWeapon.maxAmmo) return;
    
    this.isReloading = true;
    
    // Get reload time from current weapon
    const reloadTime = this.currentWeapon.reloadTime || 1.5;
    
    // Show reloading indicator in UI
    if (this.uiManager && typeof this.uiManager.showReloading === 'function') {
      this.uiManager.showReloading(true);
    }
    
    // After reload time, restore ammo
    setTimeout(() => {
      if (this.currentWeapon) {
        this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
        
        // Update UI
        if (this.uiManager) {
          this.uiManager.updateAmmo(this.currentWeapon.ammo, this.currentWeapon.maxAmmo);
          
          // Hide reloading indicator
          if (typeof this.uiManager.showReloading === 'function') {
            this.uiManager.showReloading(false);
          }
        }
      }
      
      this.isReloading = false;
      console.log('Reload complete');
    }, reloadTime * 1000);
    
    console.log('Started reloading');
  }
}