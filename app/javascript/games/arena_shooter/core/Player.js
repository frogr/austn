import * as THREE from 'three';

/**
 * Represents the player character in the game
 */
export class Player {
  constructor(gameWorld, inputManager, uiManager) {
    this.gameWorld = gameWorld;
    this.inputManager = inputManager;
    this.uiManager = uiManager;
    
    // Player stats
    this.health = 100;
    this.maxHealth = 100;
    this.isDead = false;  // Initialize isDead to false
    this.speed = 5.0;
    this.jumpForce = 10.0;
    
    // Movement state
    this.velocity = new THREE.Vector3();
    this.isOnGround = true;
    this.isJumping = false;
    
    // Camera properties
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.7, 0); // Eye height of 1.7 units
    
    // Camera controls
    this.lookSpeed = 0.005; // Increased from 0.002 for better sensitivity
    this.cameraRotation = {
      horizontal: 0,
      vertical: 0
    };
    
    // Min/max vertical rotation (in radians)
    this.minVerticalRotation = -Math.PI / 2 * 0.9; // Slightly less than straight down
    this.maxVerticalRotation = Math.PI / 2 * 0.9; // Slightly less than straight up
    
    // Create player collision body (capsule)
    this.radius = 0.5;
    this.height = 1.7;
    
    // Weapon state
    this.currentWeapon = null;
    this.isReloading = false;
    this.lastShotTime = 0;
    this.weaponCooldown = 0.1; // 100ms between shots
    
    // Player model (visible in multiplayer, not used in first-person)
    this.model = this.createPlayerModel();
    
    // Add to the scene
    gameWorld.scene.add(this.model);
    
    // Register player with team 1 (player team)
    gameWorld.registerEntityTeam(this.model, 1);
  }
  
  /**
   * Create a simple player model (not visible in first person)
   * @returns {THREE.Object3D} - The player model
   */
  createPlayerModel() {
    // Create a group for the player
    const playerGroup = new THREE.Group();
    
    // In first-person mode, we don't need a visible player model
    // This is mostly for multiplayer or if we add third-person view
    
    return playerGroup;
  }
  
  /**
   * Update the player
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Handle mouse look
    this.updateCameraRotation();
    
    // Handle movement
    this.updateMovement(deltaTime);
    
    // Handle shooting
    this.updateShooting(deltaTime);
    
    // Handle weapon switching
    this.updateWeaponSelection();
    
    // Update UI
    this.uiManager.updateHealth(this.health);
    
    // Check if player is dead
    if (this.health <= 0 && !this.isDead) {
      this.die();
    }
  }
  
  /**
   * Handle weapon selection using number keys
   */
  updateWeaponSelection() {
    // Skip if weapons aren't available
    if (!this.gameWorld.weaponSystem) return;
    
    // Check for number key presses (1-5 for weapons)
    for (let i = 1; i <= 5; i++) {
      if (this.inputManager.isKeyPressed(`Digit${i}`)) {
        // Convert to 0-based index for weapons array
        const weaponIndex = i - 1;
        
        // Only proceed if this is a valid weapon index
        if (weaponIndex >= 0 && weaponIndex < this.gameWorld.weaponSystem.weapons.length) {
          // Equip the selected weapon
          this.gameWorld.weaponSystem.equipWeapon(weaponIndex);
          
          // Stop checking after finding a pressed key
          break;
        }
      }
    }
  }
  
  /**
   * Update camera rotation based on mouse input
   */
  updateCameraRotation() {
    // Only rotate camera when pointer is locked
    if (!this.inputManager.pointerLocked) return;
    
    // Use the mouse movement from the input manager
    const dx = this.inputManager.mouseMovement.x;
    const dy = this.inputManager.mouseMovement.y;
    
    // Only update if there's actual movement
    if (dx !== 0 || dy !== 0) {
      // Update camera rotation based on mouse movement
      this.cameraRotation.horizontal -= dx * this.lookSpeed;
      this.cameraRotation.vertical -= dy * this.lookSpeed;
      
      // Clamp vertical rotation to prevent flipping
      this.cameraRotation.vertical = Math.max(
        this.minVerticalRotation,
        Math.min(this.maxVerticalRotation, this.cameraRotation.vertical)
      );
      
      // Apply rotation to camera
      this.camera.rotation.order = 'YXZ'; // Prevent gimbal lock
      this.camera.rotation.y = this.cameraRotation.horizontal;
      this.camera.rotation.x = this.cameraRotation.vertical;
      
      // Log camera rotation for debugging
      console.debug(`Camera rotation: horizontal=${this.cameraRotation.horizontal.toFixed(2)}, vertical=${this.cameraRotation.vertical.toFixed(2)}`);
    }
  }
  
  /**
   * Update player movement based on input
   * @param {number} deltaTime - Time since last update
   */
  updateMovement(deltaTime) {
    // Calculate movement direction in camera space
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    // Log movement states for debugging
    const moveStates = {
      forward: this.inputManager.moveForward,
      backward: this.inputManager.moveBackward,
      left: this.inputManager.moveLeft,
      right: this.inputManager.moveRight
    };
    
    // Apply input to movement vector
    if (moveStates.forward) moveDirection.z -= 1;
    if (moveStates.backward) moveDirection.z += 1;
    if (moveStates.left) moveDirection.x -= 1;
    if (moveStates.right) moveDirection.x += 1;
    
    // Log if we're trying to move
    if (moveDirection.length() > 0) {
      console.debug(`Move direction before normalization: x=${moveDirection.x.toFixed(2)}, z=${moveDirection.z.toFixed(2)}`);
    }
    
    // Normalize if we're moving in multiple directions
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      
      // Apply camera rotation to movement direction (so we move in the direction we're facing)
      moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraRotation.horizontal);
      
      // Log the final direction after rotation
      console.debug(`Final move direction: x=${moveDirection.x.toFixed(2)}, z=${moveDirection.z.toFixed(2)}`);
    }
    
    // Apply movement to velocity
    const moveSpeed = this.inputManager.sprint ? this.speed * 1.5 : this.speed;
    this.velocity.x = moveDirection.x * moveSpeed;
    this.velocity.z = moveDirection.z * moveSpeed;
    
    // Apply gravity
    if (!this.isOnGround) {
      this.velocity.y += this.gameWorld.gravity * deltaTime;
    } else {
      this.velocity.y = 0;
      
      // Handle jumping
      if (this.inputManager.jump && !this.isJumping) {
        this.velocity.y = this.jumpForce;
        this.isOnGround = false;
        this.isJumping = true;
      }
    }
    
    // Reset jump flag when key is released
    if (!this.inputManager.jump) {
      this.isJumping = false;
    }
    
    // Calculate new position
    const newPosition = new THREE.Vector3(
      this.camera.position.x + this.velocity.x * deltaTime,
      this.camera.position.y + this.velocity.y * deltaTime,
      this.camera.position.z + this.velocity.z * deltaTime
    );
    
    // Check collision with ground
    const groundRaycaster = new THREE.Raycaster(
      new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z),
      new THREE.Vector3(0, -1, 0),
      0,
      this.height / 2 + 0.1
    );
    
    const groundIntersects = groundRaycaster.intersectObjects(this.gameWorld.colliders);
    
    if (groundIntersects.length > 0) {
      // We hit the ground
      newPosition.y = groundIntersects[0].point.y + this.height / 2;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }
    
    // Check collisions with walls
    const playerRadius = this.radius;
    let canMove = true;
    
    // Simple collision detection with the world
    for (const collider of this.gameWorld.colliders) {
      // Skip the ground
      if (collider.rotation && collider.rotation.x === -Math.PI / 2) continue;
      
      // Get collider bounds
      const bbox = new THREE.Box3().setFromObject(collider);
      
      // Expand bounding box by player radius
      bbox.min.sub(new THREE.Vector3(playerRadius, playerRadius, playerRadius));
      bbox.max.add(new THREE.Vector3(playerRadius, playerRadius, playerRadius));
      
      // Check if new position would be inside the bounding box
      if (bbox.containsPoint(newPosition)) {
        canMove = false;
        break;
      }
    }
    
    // Check if we're within arena bounds
    if (!this.gameWorld.isPositionInBounds(newPosition)) {
      canMove = false;
    }
    
    // Apply new position if we can move there
    if (canMove) {
      this.camera.position.copy(newPosition);
      
      // Update model position to match camera (minus the height offset)
      this.model.position.set(
        this.camera.position.x,
        this.camera.position.y - this.height / 2,
        this.camera.position.z
      );
    }
  }
  
  /**
   * Update shooting mechanics
   * @param {number} deltaTime - Time since last update
   */
  updateShooting(deltaTime) {
    // Skip if we don't have a weapon
    if (!this.currentWeapon) return;
    
    // Handle reloading
    if (this.inputManager.reload && !this.isReloading && this.currentWeapon.ammo < this.currentWeapon.maxAmmo) {
      this.startReload();
      return;
    }
    
    // Update reload timer
    if (this.isReloading) {
      this.updateReload(deltaTime);
      return;
    }
    
    // Handle shooting
    const currentTime = performance.now() / 1000;
    
    if (this.inputManager.isMouseButtonPressed(0) && 
        currentTime - this.lastShotTime > this.weaponCooldown &&
        this.currentWeapon.ammo > 0) {
      this.shoot();
    }
  }
  
  /**
   * Fire the current weapon
   */
  shoot() {
    if (!this.currentWeapon || this.currentWeapon.ammo <= 0 || this.isReloading) return;
    
    // Update last shot time
    this.lastShotTime = performance.now() / 1000;
    
    // Reduce ammo
    this.currentWeapon.ammo--;
    
    // Update UI
    this.uiManager.updateAmmo(this.currentWeapon.ammo, this.currentWeapon.maxAmmo);
    
    // Calculate projectile spawn position and direction
    const spawnPosition = this.camera.position.clone();
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    
    // Create projectile
    this.gameWorld.createProjectile(
      spawnPosition,
      direction,
      100.0, // Speed
      this.currentWeapon.damage,
      1 // Team 1 = player
    );
    
    // Play sound effect
    // (In a real game, you would use the audio system here)
    
    // Create muzzle flash effect
    // (In a real game, you would create a particle effect here)
  }
  
  /**
   * Start the reload process
   */
  startReload() {
    if (!this.currentWeapon || this.isReloading) return;
    
    this.isReloading = true;
    this.reloadTimer = this.currentWeapon.reloadTime;
    
    // Update UI
    this.uiManager.showReloading(true);
    
    // Play reload sound
    // (In a real game, you would use the audio system here)
  }
  
  /**
   * Update the reload process
   * @param {number} deltaTime - Time since last update
   */
  updateReload(deltaTime) {
    this.reloadTimer -= deltaTime;
    
    if (this.reloadTimer <= 0) {
      this.finishReload();
    }
  }
  
  /**
   * Finish the reload process
   */
  finishReload() {
    if (!this.currentWeapon) return;
    
    // Restore ammo
    this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
    
    // Update state
    this.isReloading = false;
    
    // Update UI
    this.uiManager.showReloading(false);
    this.uiManager.updateAmmo(this.currentWeapon.ammo, this.currentWeapon.maxAmmo);
  }
  
  /**
   * Set the player's current weapon
   * @param {Object} weapon - Weapon object
   */
  setWeapon(weapon) {
    this.currentWeapon = weapon;
    this.uiManager.updateAmmo(weapon.ammo, weapon.maxAmmo);
  }
  
  /**
   * Apply damage to the player
   * @param {number} amount - Damage amount
   * @param {THREE.Vector3} [source] - Source of the damage
   */
  takeDamage(amount, source) {
    this.health = Math.max(0, this.health - amount);
    
    // Update UI
    this.uiManager.updateHealth(this.health);
    
    // Show damage indicator if we have a source position
    if (source) {
      // Calculate direction to damage source
      const damageDirection = new THREE.Vector2(
        source.x - this.camera.position.x,
        source.z - this.camera.position.z
      ).normalize();
      
      // Calculate angle to damage source
      const playerDirection = new THREE.Vector2(
        -Math.sin(this.cameraRotation.horizontal),
        -Math.cos(this.cameraRotation.horizontal)
      );
      
      const angle = Math.atan2(
        damageDirection.y - playerDirection.y,
        damageDirection.x - playerDirection.x
      );
      
      this.uiManager.showDamageIndicator(angle);
    }
    
    // Check if player is dead
    if (this.health <= 0) {
      this.die();
    }
  }
  
  /**
   * Handle player death
   */
  die() {
    this.isDead = true;
    this.health = 0;
    
    // Show game over screen
    this.uiManager.showGameOver();
  }
  
  /**
   * Reset the player for a new game
   */
  reset() {
    // Reset health
    this.health = this.maxHealth;
    this.isDead = false;
    
    // Reset position
    this.camera.position.set(0, 1.7, 0);
    this.velocity.set(0, 0, 0);
    
    // Reset weapon
    if (this.currentWeapon) {
      this.currentWeapon.ammo = this.currentWeapon.maxAmmo;
      this.isReloading = false;
    }
    
    // Update UI
    this.uiManager.updateHealth(this.health);
    if (this.currentWeapon) {
      this.uiManager.updateAmmo(this.currentWeapon.ammo, this.currentWeapon.maxAmmo);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove the player model from the scene
    this.gameWorld.scene.remove(this.model);
  }
}