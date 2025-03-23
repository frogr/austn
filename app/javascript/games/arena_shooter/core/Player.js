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
    
    // Set initial position - will be adjusted later
    this.camera.position.set(0, 1.7, 0); // Start at center, eye height
    
    // Initialize PointerLockControls
    this.controls = this.inputManager.initControls(this.camera, document.getElementById('arena-shooter-container'));
    
    // Physics variables
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.prevTime = performance.now();
    
    // Player state
    this.health = 100;
    this.maxHealth = 100;
    
    // Collision properties
    this.radius = 0.5; // Player collision radius
    this.height = 1.7; // Player height (matches camera height)
    
    console.log('Player initialized with collision detection');
  }
  
  update(deltaTime) {
    // Skip if controls not initialized or not locked
    if (!this.controls || !this.inputManager.pointerLocked) {
      return;
    }
    
    // Store current position before any movement
    const oldPosition = this.camera.position.clone();
    
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
    
    // Apply movement based on input with greatly increased speed (900 for very fast movement)
    if (this.inputManager.moveForward || this.inputManager.moveBackward) {
      this.velocity.z -= this.direction.z * 900.0 * deltaTime;
    }
    
    if (this.inputManager.moveLeft || this.inputManager.moveRight) {
      this.velocity.x -= this.direction.x * 900.0 * deltaTime;
    }
    
    // Impose a maximum velocity cap to prevent tunneling through objects
    // Significantly increased to allow much faster movement while maintaining collision safety
    const maxSpeed = 14.0;
    const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    
    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      this.velocity.x *= scale;
      this.velocity.z *= scale;
    }
    
    // Calculate new raw velocity vector (not yet applied)
    const moveVelocity = new THREE.Vector3(-this.velocity.x * deltaTime, 0, -this.velocity.z * deltaTime);
    const moveDistance = moveVelocity.length();
    
    // If no movement, skip collision checks
    if (moveDistance === 0) return;
    
    // Check for collisions using a more robust approach
    if (this.gameWorld && this.gameWorld.colliders && this.gameWorld.colliders.length > 0) {
      const playerRadius = 0.6; // Slightly larger radius to prevent tunneling
      
      // Create movement direction and normalize
      const moveDirection = moveVelocity.clone().normalize();
      
      // Create a raycaster to check for collisions along movement path
      const raycaster = new THREE.Raycaster(
        oldPosition.clone(), 
        moveDirection,
        0,
        moveDistance + playerRadius // Check slightly beyond movement distance
      );
      
      // Check for intersections with colliders
      const intersects = raycaster.intersectObjects(this.gameWorld.colliders);
      
      // If we hit something along our path
      if (intersects.length > 0) {
        // Get closest intersection
        const closest = intersects[0];
        
        // If intersection is within our movement range + player radius
        if (closest.distance < moveDistance + playerRadius) {
          // Calculate how far we can safely move before hitting
          const safeDistance = Math.max(0, closest.distance - playerRadius);
          
          // Calculate the ratio of safe movement
          const safeRatio = safeDistance / moveDistance;
          
          // Scale our velocity by this ratio
          this.velocity.x *= safeRatio;
          this.velocity.z *= safeRatio;
          
          // Apply a bounce/slide effect along the wall
          if (closest.face && closest.face.normal) {
            // Get the collision normal
            const normal = closest.face.normal.clone();
            // Transform normal from local to world space
            normal.transformDirection(closest.object.matrixWorld);
            
            // Calculate deflection velocity (sliding along the wall)
            const dot = moveDirection.dot(normal);
            if (dot < 0) {
              // Project movement onto collision plane
              moveDirection.sub(normal.multiplyScalar(dot));
              moveDirection.normalize();
              
              // Apply a scaled slide effect
              const slideStrength = 0.5; // Adjust for desired sliding effect
              this.velocity.x += -moveDirection.x * slideStrength;
              this.velocity.z += -moveDirection.z * slideStrength;
            }
          }
          
          // Log collision for debugging
          if (Math.random() < 0.05) {
            console.log(`Collision detected at distance ${closest.distance.toFixed(2)} with object:`, closest.object);
            console.log(`Safe movement ratio: ${safeRatio.toFixed(2)}`);
          }
        }
      }
      
      // Also check for potential embedded state (if we're already in an object)
      // This helps recover from being stuck inside objects
      this.checkAndFixEmbeddedState(playerRadius);
    }
    
    // Apply adjusted movement through PointerLockControls
    this.controls.moveRight(-this.velocity.x * deltaTime);
    this.controls.moveForward(-this.velocity.z * deltaTime);
    
    // Debug logging
    if (Math.random() < 0.01) { // Log ~1% of frames
      console.log(`Player velocity: ${this.velocity.x.toFixed(2)}, ${this.velocity.z.toFixed(2)}`);
      console.log(`Input states: W:${this.inputManager.moveForward}, S:${this.inputManager.moveBackward}, A:${this.inputManager.moveLeft}, D:${this.inputManager.moveRight}`);
      console.log(`Player position: ${this.camera.position.x.toFixed(2)}, ${this.camera.position.y.toFixed(2)}, ${this.camera.position.z.toFixed(2)}`);
    }
  }
  
  // Helper function to detect and fix the player being embedded inside objects
  checkAndFixEmbeddedState(playerRadius) {
    if (!this.gameWorld || !this.gameWorld.colliders) return;
    
    // Create a sphere at player position
    const playerPos = this.camera.position.clone();
    
    // Check each collider to see if we're embedded
    for (const collider of this.gameWorld.colliders) {
      if (!collider.geometry) continue;
      
      // Ensure the collider has a bounding box
      if (!collider.boundingBox) {
        collider.boundingBox = new THREE.Box3().setFromObject(collider);
      }
      
      // Create player bounding sphere
      const playerSphere = new THREE.Sphere(playerPos, playerRadius);
      
      // Check if the sphere intersects the collider's bounding box
      if (collider.boundingBox.intersectsSphere(playerSphere)) {
        // We're potentially embedded - get closest point on box surface
        const closestPoint = new THREE.Vector3();
        collider.boundingBox.clampPoint(playerPos, closestPoint);
        
        // Calculate push direction and distance
        const pushDir = playerPos.clone().sub(closestPoint).normalize();
        const distance = playerPos.distanceTo(closestPoint);
        
        if (distance < playerRadius) {
          // We're embedded, push the player out
          const pushDistance = playerRadius - distance + 0.05; // Add a small buffer
          
          // Apply push by moving the camera
          this.camera.position.add(pushDir.multiplyScalar(pushDistance));
          
          // Log for debugging
          console.log(`Corrected embedded state by moving player ${pushDistance.toFixed(2)} units`);
        }
      }
    }
  }
  
  // Helper function to calculate distance to a collider
  distanceToCollider(position, collider, playerRadius) {
    // For simple box colliders
    if (collider.boundingBox) {
      // Expand the box by player radius
      const expandedBox = collider.boundingBox.clone();
      expandedBox.expandByScalar(playerRadius);
      
      // Check if position is inside the expanded box
      if (expandedBox.containsPoint(position)) {
        return -1; // Inside, so collision
      }
      
      // Calculate distance to box (closest point on box to position)
      const closestPoint = new THREE.Vector3();
      expandedBox.clampPoint(position, closestPoint);
      return position.distanceTo(closestPoint);
    }
    
    // Default to no collision
    return 1;
  }
  
  dispose() {
    console.log('Player disposed');
  }
  
  /**
   * Handle player taking damage
   * @param {number} amount - Amount of damage to take
   * @param {THREE.Vector3} sourcePosition - Position where damage came from
   */
  takeDamage(amount, sourcePosition) {
    // Reduce health
    this.health = Math.max(0, this.health - amount);
    
    // Update UI
    if (this.uiManager) {
      this.uiManager.updateHealth(this.health);
      
      // Show damage indicator if source position provided
      if (sourcePosition) {
        // Calculate direction from player to damage source
        const damageDir = sourcePosition.clone().sub(this.camera.position);
        damageDir.y = 0; // Only consider horizontal direction
        
        // Convert to angle
        const damageAngle = Math.atan2(damageDir.x, damageDir.z);
        
        // Show UI damage indicator
        this.uiManager.showDamageIndicator(damageAngle);
      }
    }
    
    // Check for death
    if (this.health <= 0) {
      this.die();
    }
    
    console.log(`Player took ${amount.toFixed(1)} damage, health: ${this.health.toFixed(1)}`);
  }
  
  /**
   * Handle player death
   */
  die() {
    console.log('Player died');
    
    // Show game over UI
    if (this.uiManager) {
      this.uiManager.showGameOver();
    }
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