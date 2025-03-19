import * as THREE from 'three';

/**
 * Manages weapons, ammunition, and shooting mechanics
 */
export class WeaponSystem {
  constructor(gameWorld, player, assetManager) {
    this.gameWorld = gameWorld;
    this.player = player;
    this.assetManager = assetManager;
    
    // Available weapons
    this.weapons = [
      {
        name: 'Pistol',
        damage: 25,
        ammo: 12,
        maxAmmo: 12,
        reloadTime: 1.5,
        fireRate: 0.25, // 4 shots per second
        automatic: false,
        model: null,
        soundEffects: {
          fire: 'gunshot',
          reload: 'reload'
        }
      },
      {
        name: 'Assault Rifle',
        damage: 15,
        ammo: 30,
        maxAmmo: 30,
        reloadTime: 2.0,
        fireRate: 0.1, // 10 shots per second
        automatic: true,
        model: null,
        soundEffects: {
          fire: 'gunshot',
          reload: 'reload'
        }
      },
      {
        name: 'Shotgun',
        damage: 8, // Per pellet, fires 8 pellets
        ammo: 8,
        maxAmmo: 8,
        reloadTime: 2.5,
        fireRate: 0.8, // 1.25 shots per second
        automatic: false,
        pellets: 8,
        spread: 0.1,
        model: null,
        soundEffects: {
          fire: 'gunshot',
          reload: 'reload'
        }
      },
      {
        name: 'Rocket Launcher',
        damage: 100, // Direct hit damage
        splashDamage: 50, // Splash damage
        splashRadius: 5, // Splash radius
        ammo: 4,
        maxAmmo: 4,
        reloadTime: 3.0,
        fireRate: 1.0, // 1 shot per second
        automatic: false,
        projectileSpeed: 50, // Slower moving projectile
        model: null,
        soundEffects: {
          fire: 'gunshot', // Would be rocket sound in a real game
          reload: 'reload'
        }
      },
      {
        name: 'Sniper Rifle',
        damage: 100,
        ammo: 5,
        maxAmmo: 5,
        reloadTime: 2.5,
        fireRate: 1.5, // 0.67 shots per second
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
  equipWeapon(index) {
    // Validate index
    if (index < 0 || index >= this.weapons.length) {
      console.warn(`Invalid weapon index: ${index}`);
      return;
    }
    
    // Remove current weapon model from scene if there is one
    if (this.player.currentWeapon && this.player.currentWeapon.model) {
      this.gameWorld.scene.remove(this.player.currentWeapon.model);
    }
    
    // Equip the new weapon
    const weapon = this.weapons[index];
    this.player.setWeapon(weapon);
    
    // Add the weapon model to the scene
    if (weapon.model) {
      this.gameWorld.scene.add(weapon.model);
    }
    
    // Update UI
    if (this.player.uiManager) {
      this.player.uiManager.updateAmmo(weapon.ammo, weapon.maxAmmo);
    }
  }
  
  /**
   * Fire the current weapon
   */
  fireWeapon() {
    const weapon = this.player.currentWeapon;
    
    // Skip if no weapon, no ammo, or reloading
    if (!weapon || weapon.ammo <= 0 || this.player.isReloading) return;
    
    // Decrease ammo
    weapon.ammo--;
    
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
    if (weapon.name === 'Shotgun') {
      // Shotgun fires multiple pellets with spread
      for (let i = 0; i < weapon.pellets; i++) {
        // Apply random spread
        const spread = weapon.spread;
        const pelletDirection = cameraDirection.clone();
        
        pelletDirection.x += (Math.random() - 0.5) * spread;
        pelletDirection.y += (Math.random() - 0.5) * spread;
        pelletDirection.z += (Math.random() - 0.5) * spread;
        
        pelletDirection.normalize();
        
        // Create projectile
        this.gameWorld.createProjectile(
          startPosition.clone(),
          pelletDirection,
          100.0,
          weapon.damage,
          1, // Team 1 = player
          { type: 'bullet' }
        );
      }
    } else if (weapon.name === 'Rocket Launcher') {
      // Rocket launcher - slower projectile with splash damage
      this.gameWorld.createProjectile(
        startPosition,
        cameraDirection,
        weapon.projectileSpeed || 50.0,
        weapon.damage,
        1, // Team 1 = player
        { 
          type: 'rocket',
          splashDamage: weapon.splashDamage || 50,
          splashRadius: weapon.splashRadius || 5,
          model: this.createRocketModel()
        }
      );
    } else if (weapon.name === 'Sniper Rifle') {
      // Sniper rifle - high velocity projectile with damage falloff
      this.gameWorld.createProjectile(
        startPosition,
        cameraDirection,
        150.0, // Higher velocity
        weapon.damage,
        1, // Team 1 = player
        { 
          type: 'bullet',
          penetrating: true, // Can go through multiple enemies
          tracer: true // Visual effect for sniper shots
        }
      );
    } else {
      // Standard single projectile
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
  reloadWeapon() {
    const weapon = this.player.currentWeapon;
    
    // Skip if no weapon or already full
    if (!weapon || weapon.ammo >= weapon.maxAmmo) return;
    
    // Start reloading
    this.player.startReload();
    
    // Play reload sound
    if (weapon.soundEffects && weapon.soundEffects.reload) {
      this.playSound(weapon.soundEffects.reload);
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