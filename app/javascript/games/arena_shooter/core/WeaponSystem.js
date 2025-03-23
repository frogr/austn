import * as THREE from 'three';

/**
 * Manages weapons, ammunition, and shooting mechanics
 */
export class WeaponSystem {
  constructor(gameWorld, player, assetManager) {
    this.gameWorld = gameWorld;
    this.player = player;
    this.assetManager = assetManager;
    
    // Check if player exists and has required methods
    if (!player) {
      console.error('Player object is null or undefined in WeaponSystem constructor');
      return;
    }
    
    // Add setWeapon method to player if missing
    if (typeof this.player.setWeapon !== 'function') {
      console.warn('Adding setWeapon method to player');
      this.player.setWeapon = (weapon) => {
        this.player.currentWeapon = weapon;
        if (this.player.uiManager) {
          this.player.uiManager.updateAmmo(weapon.ammo, weapon.maxAmmo);
        }
        console.log(`Equipped weapon: ${weapon.name}`);
      };
    }
    
    // Available weapons
    this.weapons = [
      {
        index: 0,
        name: 'Pistol',
        damage: 33.4, // 3 shots to do 100 damage
        ammo: 12,
        maxAmmo: 12,
        reloadTime: 1.5,
        fireRate: 0.5, // 2 shots per second (slow)
        automatic: false,
        model: null,
        soundEffects: {
          fire: 'gunshot',
          reload: 'reload'
        }
      },
      {
        index: 1,
        name: 'Assault Rifle',
        damage: 20, // 5 shots to do 100 damage
        ammo: 30,
        maxAmmo: 30,
        reloadTime: 2.0,
        fireRate: 0.08, // 12.5 shots per second (fast)
        automatic: true,
        spread: 0.05, // Built-in inaccuracy
        model: null,
        soundEffects: {
          fire: 'gunshot',
          reload: 'reload'
        }
      },
      {
        index: 2,
        name: 'Shotgun',
        damage: 12.5, // 8 pellets * 12.5 = 100 damage per shot
        ammo: 6, // Only 6 shells as requested
        maxAmmo: 6,
        reloadTime: 2.5,
        fireRate: 1.0, // 1 shot per second
        automatic: false,
        pellets: 8, // 8 pellets per shot
        spread: 0.15, // Broad spray pattern
        model: null,
        soundEffects: {
          fire: 'gunshot',
          reload: 'reload'
        }
      },
      {
        index: 3,
        name: 'Rocket Launcher',
        damage: 50, // Direct hit damage = 50
        splashDamage: 50, // Splash damage = 50
        splashRadius: 6, // Splash radius
        ammo: 6, // 6 rockets as requested
        maxAmmo: 6,
        reloadTime: 3.0,
        fireRate: 1.2, // 0.83 shots per second (slow)
        automatic: false,
        projectileSpeed: 40, // Slower moving projectile
        model: null,
        soundEffects: {
          fire: 'gunshot', // Would be rocket sound in a real game
          reload: 'reload'
        }
      },
      {
        index: 4,
        name: 'Sniper Rifle',
        damage: 50, // 50 damage per shot
        ammo: 5,
        maxAmmo: 5,
        reloadTime: 2.5,
        fireRate: 2.0, // 0.5 shots per second (very slow)
        automatic: false,
        model: null,
        scopeZoom: 3, // Zoom factor when scoped
        soundEffects: {
          fire: 'gunshot',
          reload: 'reload'
        }
      }
    ];
    
    // Equip the player with the default weapon (pistol)
    this.equipWeapon(0);
    
    // Sound effects
    this.audioListener = new THREE.AudioListener();
    this.sounds = new Map();
    
    // Initialize weapons
    this.initializeWeapons();
  }
  
  /**
   * Initialize weapon models and sounds
   */
  initializeWeapons() {
    // Create simple geometric models for weapons
    // In a real game, you would load detailed models
    
    // Pistol model
    const pistolGroup = new THREE.Group();
    
    const pistolBarrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    pistolBarrel.position.z = -0.1;
    pistolGroup.add(pistolBarrel);
    
    const pistolBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.15, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    pistolBody.position.y = -0.05;
    pistolGroup.add(pistolBody);
    
    this.weapons[0].model = pistolGroup;
    
    // Assault rifle model
    const rifleGroup = new THREE.Group();
    
    const rifleBarrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    rifleBarrel.position.z = -0.25;
    rifleGroup.add(rifleBarrel);
    
    const rifleBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.15, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    rifleBody.position.y = -0.05;
    rifleGroup.add(rifleBody);
    
    const rifleMagazine = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.2, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    rifleMagazine.position.y = -0.15;
    rifleMagazine.position.z = 0.05;
    rifleGroup.add(rifleMagazine);
    
    this.weapons[1].model = rifleGroup;
    
    // Shotgun model
    const shotgunGroup = new THREE.Group();
    
    const shotgunBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    shotgunBarrel.position.z = -0.25;
    shotgunBarrel.rotation.x = Math.PI / 2;
    shotgunGroup.add(shotgunBarrel);
    
    const shotgunBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    shotgunGroup.add(shotgunBody);
    
    const shotgunStock = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.15, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 }) // Wood color
    );
    shotgunStock.position.y = -0.05;
    shotgunStock.position.z = 0.2;
    shotgunGroup.add(shotgunStock);
    
    this.weapons[2].model = shotgunGroup;
    
    // Rocket Launcher model
    const rocketLauncherGroup = new THREE.Group();
    
    const rocketBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x666666 })
    );
    rocketBarrel.position.z = -0.3;
    rocketBarrel.rotation.x = Math.PI / 2;
    rocketLauncherGroup.add(rocketBarrel);
    
    const rocketBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    rocketLauncherGroup.add(rocketBody);
    
    const rocketSight = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    rocketSight.position.y = 0.1;
    rocketLauncherGroup.add(rocketSight);
    
    this.weapons[3].model = rocketLauncherGroup;
    
    // Sniper Rifle model
    const sniperGroup = new THREE.Group();
    
    const sniperBarrel = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.03, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    sniperBarrel.position.z = -0.35;
    sniperGroup.add(sniperBarrel);
    
    const sniperBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.12, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    sniperGroup.add(sniperBody);
    
    const sniperStock = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.1, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x8B4513 }) // Wood color
    );
    sniperStock.position.z = 0.2;
    sniperGroup.add(sniperStock);
    
    // Scope
    const sniperScope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    sniperScope.position.y = 0.07;
    sniperScope.position.z = -0.1;
    sniperGroup.add(sniperScope);
    
    // Scope lens
    const scopeLens = new THREE.Mesh(
      new THREE.CircleGeometry(0.02, 8),
      new THREE.MeshStandardMaterial({ color: 0x3366ff, emissive: 0x3366ff, emissiveIntensity: 0.5 })
    );
    scopeLens.position.y = 0.07;
    scopeLens.position.z = -0.16;
    scopeLens.rotation.x = Math.PI / 2;
    sniperGroup.add(scopeLens);
    
    this.weapons[4].model = sniperGroup;
    
    // Load sound effects
    // In a real game, you would load actual sound files
    this.loadSoundEffects();
  }
  
  /**
   * Load weapon sound effects
   */
  loadSoundEffects() {
    // In a real implementation, you would load actual sound files
    // For this example, we'll use the asset manager
    
    try {
      // Create audio objects for each sound effect
      this.loadSoundEffect('gunshot');
      this.loadSoundEffect('reload');
      this.loadSoundEffect('hit');
    } catch (e) {
      console.warn('Error loading sound effects:', e);
    }
  }
  
  /**
   * Load a single sound effect with error handling
   * @param {string} name - Sound effect name
   */
  loadSoundEffect(name) {
    try {
      if (this.assetManager.sounds.has(name)) {
        const buffer = this.assetManager.getAsset('sound', name);
        
        // Skip if buffer is null (happens when sound loading fails)
        if (!buffer) {
          console.warn(`Sound buffer for ${name} is null, skipping sound setup`);
          return;
        }
        
        const sound = new THREE.Audio(this.audioListener);
        sound.setBuffer(buffer);
        this.sounds.set(name, sound);
        console.log(`Sound ${name} loaded successfully`);
      } else {
        console.warn(`Sound ${name} not found in asset manager`);
      }
    } catch (e) {
      console.warn(`Error setting up sound ${name}:`, e);
    }
  }
  
  /**
   * Update the weapon system
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Update current weapon model position and rotation
    this.updateWeaponModel();
  }
  
  /**
   * Update the position and rotation of the weapon model
   */
  updateWeaponModel() {
    // If we don't have a current weapon, skip
    if (!this.player.currentWeapon || !this.player.currentWeapon.model) return;
    
    // Position the weapon model in front of the camera
    const cameraPosition = this.player.camera.position.clone();
    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(this.player.camera.quaternion);
    
    // Offset the weapon to the bottom right of the screen
    const weaponPosition = cameraPosition.clone().add(
      new THREE.Vector3(0.2, -0.2, -0.5).applyQuaternion(this.player.camera.quaternion)
    );
    
    this.player.currentWeapon.model.position.copy(weaponPosition);
    
    // Match the weapon rotation to the camera
    this.player.currentWeapon.model.rotation.copy(this.player.camera.rotation);
  }
  
  /**
   * Equip a weapon
   * @param {number} index - Index of the weapon to equip
   */
  // Improved equipWeapon method with better error handling and UI updates
  equipWeapon(index) {
    // Validate index
    if (index < 0 || index >= this.weapons.length) {
      console.warn(`Invalid weapon index: ${index}`);
      return;
    }
    
    try {
      // Remove current weapon model from scene if there is one
      if (this.player.currentWeapon && this.player.currentWeapon.model) {
        this.gameWorld.scene.remove(this.player.currentWeapon.model);
      }
      
      // Equip the new weapon
      const weapon = this.weapons[index];
      console.log('Equipping weapon:', weapon.name, 'with index:', index);
      
      // Always set weapon directly first as a fallback
      this.player.currentWeapon = weapon;
      
      // Store the currently equipped weapon index
      this.currentWeaponIndex = index;
      
      // Try to use setWeapon method if available
      try {
        if (typeof this.player.setWeapon === 'function') {
          this.player.setWeapon(weapon);
        } else {
          // Update UI if available
          if (this.player.uiManager) {
            this.player.uiManager.updateAmmo(weapon.ammo, weapon.maxAmmo);
          }
          console.log(`Equipped weapon: ${weapon.name} (direct assignment)`);
        }
      } catch (e) {
        console.warn('Error calling player.setWeapon:', e);
        // Already set the weapon directly above, so we can continue
      }
      
      // Add the weapon model to the scene
      if (weapon.model) {
        this.gameWorld.scene.add(weapon.model);
      }
      
      // Update weapon selector UI with explicit index
      if (this.player && this.player.uiManager && typeof this.player.uiManager.updateWeaponSelector === 'function') {
        console.log(`Calling updateWeaponSelector with index: ${index}, name: ${weapon.name}`);
        this.player.uiManager.updateWeaponSelector(index, weapon.name);
      } else {
        console.warn('Could not update weapon UI - missing UI manager');
      }
    } catch (error) {
      console.error('Error in equipWeapon:', error);
    }
  }
  /**
   * Fire the current weapon
   */
  fireWeapon() {
    const weapon = this.player.currentWeapon;
    
    // Skip if no weapon, no ammo, or reloading
    if (!weapon || weapon.ammo <= 0 || this.player.isReloading) return;
    
    // Check if weapon is ready to fire (cooldown)
    if (weapon.lastFiredTime && performance.now() - weapon.lastFiredTime < weapon.fireRate * 1000) {
      return;
    }
    
    // Decrease ammo
    weapon.ammo--;
    
    // Update last fired time
    weapon.lastFiredTime = performance.now();
    
    // Update UI
    if (this.player.uiManager) {
      this.player.uiManager.updateAmmo(weapon.ammo, weapon.maxAmmo);
    }
    
    // Get camera position and direction
    const cameraPosition = this.player.camera.position.clone();
    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(this.player.camera.quaternion);
    
    // Adjust starting position to be slightly in front of the camera
    const startPosition = cameraPosition.clone().add(cameraDirection.clone().multiplyScalar(0.5));
    
    // Handle different weapon types
    switch (weapon.name) {
      case 'Pistol':
        // Single accurate shot
        this.gameWorld.createProjectile(
          startPosition,
          cameraDirection,
          100.0,
          weapon.damage,
          1, // Team 1 = player
          { 
            type: 'bullet',
            color: 0xffff00 // Yellow bullet
          }
        );
        break;
        
      case 'Assault Rifle':
        // Fast but inaccurate shots
        const assaultSpread = 0.05;
        const rifleDirection = cameraDirection.clone();
        
        // Add random spread for assault rifle
        rifleDirection.x += (Math.random() - 0.5) * assaultSpread;
        rifleDirection.y += (Math.random() - 0.5) * assaultSpread;
        rifleDirection.z += (Math.random() - 0.5) * assaultSpread;
        rifleDirection.normalize();
        
        this.gameWorld.createProjectile(
          startPosition,
          rifleDirection,
          120.0,
          weapon.damage,
          1, // Team 1 = player
          { 
            type: 'bullet',
            color: 0x00ffff // Cyan bullet
          }
        );
        break;
        
      case 'Shotgun':
        // Broad spray pattern - 8 pellets
        for (let i = 0; i < 8; i++) {
          // Apply wider spread for shotgun
          const shotgunSpread = 0.15;
          const pelletDirection = cameraDirection.clone();
          
          pelletDirection.x += (Math.random() - 0.5) * shotgunSpread;
          pelletDirection.y += (Math.random() - 0.5) * shotgunSpread;
          pelletDirection.z += (Math.random() - 0.5) * shotgunSpread;
          
          pelletDirection.normalize();
          
          // Create projectile
          this.gameWorld.createProjectile(
            startPosition.clone(),
            pelletDirection,
            100.0,
            weapon.damage,
            1, // Team 1 = player
            { 
              type: 'bullet',
              color: 0xff6600, // Orange pellets
              scale: 0.7 // Smaller pellets
            }
          );
        }
        break;
        
      case 'Rocket Launcher':
        // Slow projectile with explosion effect
        this.gameWorld.createProjectile(
          startPosition,
          cameraDirection,
          40.0, // Slower speed
          weapon.damage,
          1, // Team 1 = player
          { 
            type: 'rocket',
            splashDamage: weapon.splashDamage || 50,
            splashRadius: weapon.splashRadius || 5,
            model: this.createRocketModel(),
            onImpact: (position) => this.createExplosion(position)
          }
        );
        break;
        
      case 'Sniper Rifle':
        // High damage, penetrating shot
        this.gameWorld.createProjectile(
          startPosition,
          cameraDirection,
          200.0, // Higher velocity
          weapon.damage,
          1, // Team 1 = player
          { 
            type: 'bullet',
            penetrating: true, // Can go through multiple enemies
            tracer: true, // Visual effect for sniper shots
            color: 0xff0000, // Red bullet
            scale: 1.5 // Larger bullet
          }
        );
        break;
        
      default:
        // Fallback for any other weapon
        this.gameWorld.createProjectile(
          startPosition,
          cameraDirection,
          100.0,
          weapon.damage,
          1, // Team 1 = player
          { type: 'bullet' }
        );
    }
    
    // Play sound effect
    if (weapon.soundEffects && weapon.soundEffects.fire) {
      this.playSound(weapon.soundEffects.fire);
    }
    
    // Create muzzle flash effect
    this.createMuzzleFlash();
  }
  
  /**
   * Create an explosion effect at the specified position
   * @param {THREE.Vector3} position - Position for the explosion
   */
  createExplosion(position) {
    if (!position) return;
    
    // Create explosion light
    const explosionLight = new THREE.PointLight(0xff6600, 5, 10);
    explosionLight.position.copy(position);
    this.gameWorld.scene.add(explosionLight);
    
    // Create explosion particles
    const explosionGroup = new THREE.Group();
    explosionGroup.position.copy(position);
    
    // Create particles
    const particleCount = 20;
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Random position within sphere
      const radius = Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
      particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
      particle.position.z = radius * Math.cos(phi);
      
      particle.scale.multiplyScalar(Math.random() * 0.5 + 0.5);
      
      explosionGroup.add(particle);
    }
    
    this.gameWorld.scene.add(explosionGroup);
    
    // Add a shockwave
    const shockwaveGeometry = new THREE.RingGeometry(0, 0.1, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff9900, 
      transparent: true, 
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.rotation.x = Math.PI / 2; // Align with ground
    shockwave.position.copy(position);
    this.gameWorld.scene.add(shockwave);
    
    // Animate explosion
    let explosionTime = 0;
    const animateExplosion = () => {
      explosionTime += 0.05;
      
      // Fade light
      if (explosionLight) {
        explosionLight.intensity = Math.max(0, 5 - explosionTime * 5);
      }
      
      // Expand and fade shockwave
      if (shockwave) {
        shockwave.scale.x = shockwave.scale.y = shockwave.scale.z = explosionTime * 5;
        shockwave.material.opacity = Math.max(0, 0.7 - explosionTime);
      }
      
      // Move particles outward and fade
      explosionGroup.children.forEach(particle => {
        particle.position.multiplyScalar(1.05);
        if (particle.material.opacity === undefined) {
          particle.material.transparent = true;
          particle.material.opacity = 1.0;
        }
        particle.material.opacity = Math.max(0, 1 - explosionTime);
      });
      
      // Continue animation or cleanup
      if (explosionTime < 1) {
        requestAnimationFrame(animateExplosion);
      } else {
        // Cleanup
        this.gameWorld.scene.remove(explosionLight);
        this.gameWorld.scene.remove(explosionGroup);
        this.gameWorld.scene.remove(shockwave);
      }
    };
    
    // Start animation
    animateExplosion();
  }
  
  /**
   * Create a muzzle flash effect
   */
  createMuzzleFlash() {
    // Skip if no current weapon
    if (!this.player.currentWeapon || !this.player.currentWeapon.model) return;
    
    // Create a point light for the flash
    const flashLight = new THREE.PointLight(0xffff00, 2, 3);
    
    // Position the light at the end of the weapon barrel
    const weapon = this.player.currentWeapon.model;
    
    // This is a simplification - in a real game, you would position this based on the weapon model
    const barrelTip = weapon.position.clone().add(
      new THREE.Vector3(0, 0, -0.5).applyQuaternion(weapon.quaternion)
    );
    
    flashLight.position.copy(barrelTip);
    
    // Add to scene
    this.gameWorld.scene.add(flashLight);
    
    // Create a sprite for the muzzle flash
    let flashSprite;
    
    if (this.assetManager.textures.has('muzzleFlash')) {
      const flashTexture = this.assetManager.getAsset('texture', 'muzzleFlash');
      const flashMaterial = new THREE.SpriteMaterial({
        map: flashTexture,
        blending: THREE.AdditiveBlending,
        color: 0xffff00,
        transparent: true,
        depthWrite: false
      });
      
      flashSprite = new THREE.Sprite(flashMaterial);
      flashSprite.scale.set(1, 1, 1);
      flashSprite.position.copy(barrelTip);
      
      this.gameWorld.scene.add(flashSprite);
    }
    
    // Remove the flash effect after a short time
    setTimeout(() => {
      this.gameWorld.scene.remove(flashLight);
      if (flashSprite) {
        this.gameWorld.scene.remove(flashSprite);
      }
    }, 50);
  }
  
  /**
   * Reload the current weapon
   */
  // Improved reloadWeapon method with better error handling
  reloadWeapon() {
    try {
      const weapon = this.player.currentWeapon;
      
      // Skip if no weapon or already full
      if (!weapon || weapon.ammo >= weapon.maxAmmo) return;
      
      // Add startReload method to player if missing
      if (typeof this.player.startReload !== 'function') {
        this.player.startReload = () => {
          if (this.player.isReloading) return;
          
          this.player.isReloading = true;
          
          // Get reload time from current weapon
          const reloadTime = this.player.currentWeapon ? this.player.currentWeapon.reloadTime || 1.5 : 1.5;
          
          // After reload time, restore ammo
          setTimeout(() => {
            if (this.player.currentWeapon) {
              this.player.currentWeapon.ammo = this.player.currentWeapon.maxAmmo;
              
              // Update UI
              if (this.player.uiManager) {
                this.player.uiManager.updateAmmo(this.player.currentWeapon.ammo, this.player.currentWeapon.maxAmmo);
              }
            }
            
            this.player.isReloading = false;
            console.log('Reload complete');
          }, reloadTime * 1000);
          
          console.log('Started reloading');
        };
      }
      
      try {
        // Try to use player's startReload method
        this.player.startReload();
      } catch (e) {
        console.warn('Error calling startReload:', e);
        
        // Fallback: handle reloading directly
        if (this.player.isReloading) return;
        
        this.player.isReloading = true;
        
        // Get reload time from weapon
        const reloadTime = weapon.reloadTime || 1.5;
        
        // After reload time, restore ammo
        setTimeout(() => {
          if (weapon) {
            weapon.ammo = weapon.maxAmmo;
            
            // Update UI
            if (this.player.uiManager) {
              this.player.uiManager.updateAmmo(weapon.ammo, weapon.maxAmmo);
            }
          }
          
          this.player.isReloading = false;
          console.log('Reload complete');
        }, reloadTime * 1000);
        
        console.log('Started reloading (fallback)');
      }
      
      // Play reload sound
      if (weapon.soundEffects && weapon.soundEffects.reload) {
        this.playSound(weapon.soundEffects.reload);
      }
    } catch (error) {
      console.error('Error in reloadWeapon:', error);
    }
  }
  
  /**
   * Switch to the next weapon
   */
  switchToNextWeapon() {
    // Find current weapon index
    const currentIndex = this.weapons.findIndex(w => w === this.player.currentWeapon);
    
    // Calculate next index (wrap around)
    const nextIndex = (currentIndex + 1) % this.weapons.length;
    
    // Equip next weapon
    this.equipWeapon(nextIndex);
  }
  
  /**
   * Switch to the previous weapon
   */
  switchToPreviousWeapon() {
    // Find current weapon index
    const currentIndex = this.weapons.findIndex(w => w === this.player.currentWeapon);
    
    // Calculate previous index (wrap around)
    const prevIndex = (currentIndex - 1 + this.weapons.length) % this.weapons.length;
    
    // Equip previous weapon
    this.equipWeapon(prevIndex);
  }
  
  /**
   * Create a 3D model for the rocket projectile
   * @returns {THREE.Object3D} The rocket model
   */
  createRocketModel() {
    const rocketGroup = new THREE.Group();
    
    // Rocket body
    const rocketBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x666666 })
    );
    rocketBody.rotation.x = Math.PI / 2;
    rocketGroup.add(rocketBody);
    
    // Rocket nose cone
    const noseCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    noseCone.position.z = 0.2;
    noseCone.rotation.x = Math.PI / 2;
    rocketGroup.add(noseCone);
    
    // Rocket fins
    const finMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const addFin = (rotationY) => {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.05, 0.01),
        finMaterial
      );
      fin.position.z = -0.1;
      fin.rotation.y = rotationY;
      rocketGroup.add(fin);
    };
    
    // Add 4 fins at 90-degree intervals
    addFin(0);
    addFin(Math.PI / 2);
    addFin(Math.PI);
    addFin(Math.PI * 1.5);
    
    // Rocket exhaust (point light)
    const exhaust = new THREE.PointLight(0xff6600, 2, 2);
    exhaust.position.z = -0.15;
    rocketGroup.add(exhaust);
    
    return rocketGroup;
  }
  
  /**
   * Play a sound effect with error handling
   * @param {string} soundName - Name of the sound effect to play
   */
  playSound(soundName) {
    try {
      if (this.sounds.has(soundName)) {
        const sound = this.sounds.get(soundName);
        if (sound.isPlaying) sound.stop();
        sound.play();
      } else {
        console.log(`Sound ${soundName} not loaded, skipping playback`);
      }
    } catch (e) {
      console.warn(`Error playing sound ${soundName}:`, e);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove all weapon models from the scene
    this.weapons.forEach(weapon => {
      if (weapon.model) {
        this.gameWorld.scene.remove(weapon.model);
      }
    });
    
    // Stop and clear all sounds
    this.sounds.forEach(sound => {
      try {
        if (sound.isPlaying) sound.stop();
      } catch (e) {
        console.warn('Error stopping sound:', e);
      }
    });
    this.sounds.clear();
  }
}