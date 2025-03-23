import * as THREE from 'three';
import { State } from '../StateMachine.js';
import { TransformComponent, PhysicsComponent, HealthComponent, MeshComponent } from '../../ecs/index.js';

/**
 * Playing state for gameplay
 */
export class PlayingState extends State {
  constructor() {
    super('playing');
  }
  
  onEnter(stateMachine, prevState, params = {}) {
    const { engine, levelId = 'arena' } = params;
    
    // Store references
    this.engine = engine;
    this.world = engine.world;
    this.entityFactory = engine.entityFactory;
    this.levelId = levelId;
    this.stateMachine = stateMachine;
    
    // Force resume game engine
    console.log('Playing state entered, resuming engine...');
    this.engine.isRunning = true;
    this.engine.lastFrameTime = performance.now();
    this.engine.animate();
    
    // Lock pointer for controls
    if (this.engine.controls) {
      console.log('Locking pointer controls...');
      this.engine.controls.lock();
    }
    
    // Initialize UI
    this.initializeUI();
    
    // Initialize level
    this.initializeLevel(levelId);
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  onExit(stateMachine, nextState) {
    // Clean up event listeners
    this.removeEventListeners();
    
    // Hide gameplay UI
    this.hideUI();
    
    // Unlock pointer if not transitioning to pause menu
    if (nextState.name !== 'menu') {
      if (this.engine.controls) {
        this.engine.controls.unlock();
      }
    }
  }
  
  update(stateMachine, deltaTime) {
    // Update player movement from input state
    this.updatePlayerMovement(deltaTime);
    
    // Update game state
    this.updateGameState(deltaTime);
    
    // Update UI
    this.updateUI(deltaTime);
  }
  
  /**
   * Initialize UI elements
   */
  initializeUI() {
    // Create or get UI container
    this.uiContainer = document.getElementById('game-ui') || this.createUIContainer();
    
    // Show UI
    if (this.uiContainer) {
      console.log('Showing game UI');
      this.uiContainer.style.display = 'block';
    } else {
      console.error('Failed to find or create UI container');
    }
    
    // Hide all screens except game UI
    const screens = [
      'loading-screen',
      'start-screen',
      'game-over-screen'
    ];
    
    screens.forEach(screenId => {
      const screen = document.getElementById(screenId);
      if (screen) {
        screen.style.display = 'none';
      }
    });
    
    // If we have any custom-created menu containers, hide those too
    const menuContainers = document.querySelectorAll('[id^="menu-"]');
    menuContainers.forEach(container => {
      container.style.display = 'none';
    });
  }
  
  /**
   * Create UI container and elements
   * @returns {HTMLElement} - Created UI container
   */
  createUIContainer() {
    // Create container
    const container = document.createElement('div');
    container.id = 'game-ui';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    
    // Create HUD elements
    this.createHealthBar(container);
    this.createAmmoDisplay(container);
    this.createScoreDisplay(container);
    this.createWeaponDisplay(container);
    this.createCrosshair(container);
    
    // Add to document
    document.body.appendChild(container);
    
    return container;
  }
  
  /**
   * Create health bar element
   * @param {HTMLElement} container - Parent container
   */
  createHealthBar(container) {
    const healthBar = document.createElement('div');
    healthBar.id = 'health-bar';
    healthBar.style.position = 'absolute';
    healthBar.style.bottom = '20px';
    healthBar.style.left = '20px';
    healthBar.style.width = '200px';
    healthBar.style.height = '20px';
    healthBar.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    healthBar.style.border = '2px solid #555';
    healthBar.style.borderRadius = '5px';
    
    const healthFill = document.createElement('div');
    healthFill.id = 'health-fill';
    healthFill.style.width = '100%';
    healthFill.style.height = '100%';
    healthFill.style.backgroundColor = '#00cc00';
    healthFill.style.transition = 'width 0.2s ease-out';
    healthBar.appendChild(healthFill);
    
    const healthText = document.createElement('div');
    healthText.id = 'health-text';
    healthText.textContent = '100/100';
    healthText.style.position = 'absolute';
    healthText.style.top = '0';
    healthText.style.left = '0';
    healthText.style.width = '100%';
    healthText.style.height = '100%';
    healthText.style.display = 'flex';
    healthText.style.alignItems = 'center';
    healthText.style.justifyContent = 'center';
    healthText.style.color = 'white';
    healthText.style.fontWeight = 'bold';
    healthText.style.textShadow = '1px 1px 2px black';
    healthBar.appendChild(healthText);
    
    container.appendChild(healthBar);
  }
  
  /**
   * Create ammo display element
   * @param {HTMLElement} container - Parent container
   */
  createAmmoDisplay(container) {
    const ammoDisplay = document.createElement('div');
    ammoDisplay.id = 'ammo-display';
    ammoDisplay.style.position = 'absolute';
    ammoDisplay.style.bottom = '20px';
    ammoDisplay.style.right = '20px';
    ammoDisplay.style.color = 'white';
    ammoDisplay.style.fontFamily = 'monospace';
    ammoDisplay.style.fontSize = '24px';
    ammoDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    ammoDisplay.style.padding = '5px 15px';
    ammoDisplay.style.borderRadius = '5px';
    ammoDisplay.style.border = '2px solid #555';
    ammoDisplay.textContent = '30 / 90';
    
    container.appendChild(ammoDisplay);
  }
  
  /**
   * Create score display element
   * @param {HTMLElement} container - Parent container
   */
  createScoreDisplay(container) {
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score-display';
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '20px';
    scoreDisplay.style.right = '20px';
    scoreDisplay.style.color = 'white';
    scoreDisplay.style.fontSize = '20px';
    scoreDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    scoreDisplay.style.padding = '5px 15px';
    scoreDisplay.style.borderRadius = '5px';
    scoreDisplay.textContent = 'Score: 0';
    
    container.appendChild(scoreDisplay);
  }
  
  /**
   * Create weapon display element
   * @param {HTMLElement} container - Parent container
   */
  createWeaponDisplay(container) {
    const weaponDisplay = document.createElement('div');
    weaponDisplay.id = 'weapon-display';
    weaponDisplay.style.position = 'absolute';
    weaponDisplay.style.bottom = '50px';
    weaponDisplay.style.right = '20px';
    weaponDisplay.style.color = 'white';
    weaponDisplay.style.fontSize = '16px';
    weaponDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    weaponDisplay.style.padding = '5px 10px';
    weaponDisplay.style.borderRadius = '5px';
    weaponDisplay.textContent = 'Pistol';
    
    container.appendChild(weaponDisplay);
  }
  
  /**
   * Create crosshair element
   * @param {HTMLElement} container - Parent container
   */
  createCrosshair(container) {
    const crosshair = document.createElement('div');
    crosshair.id = 'crosshair';
    crosshair.style.position = 'absolute';
    crosshair.style.top = '50%';
    crosshair.style.left = '50%';
    crosshair.style.width = '10px';
    crosshair.style.height = '10px';
    crosshair.style.borderRadius = '50%';
    crosshair.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    crosshair.style.transform = 'translate(-50%, -50%)';
    
    container.appendChild(crosshair);
  }
  
  /**
   * Hide UI elements
   */
  hideUI() {
    if (this.uiContainer) {
      this.uiContainer.style.display = 'none';
    }
  }
  
  /**
   * Initialize level
   * @param {string} levelId - Level identifier
   */
  initializeLevel(levelId) {
    // Reset world
    this.resetWorld();
    
    // Create the level
    this.createLevel(levelId);
    
    // Create player
    this.createPlayer();
    
    // Create enemies
    this.createEnemies(levelId);
  }
  
  /**
   * Reset the world
   */
  resetWorld() {
    // Remove all entities except global ones
    for (const entity of this.world.getEntities()) {
      if (!entity.hasTag('global')) {
        this.world.removeEntity(entity);
      }
    }
    
    // Reset game state
    this.gameState = {
      score: 0,
      enemiesKilled: 0,
      playerHealth: 100,
      playerAmmo: 30,
      playerAmmoReserve: 90,
      currentWeapon: 'pistol',
      levelTime: 0
    };
  }
  
  /**
   * Create level environment
   * @param {string} levelId - Level identifier
   */
  createLevel(levelId) {
    // Create different level layouts based on ID
    switch (levelId) {
      case 'arena':
        this.createArenaLevel();
        break;
      case 'narrow':
        this.createNarrowLevel();
        break;
      case 'open':
        this.createOpenLevel();
        break;
      case 'multi':
        this.createMultiLevelLevel();
        break;
      default:
        this.createArenaLevel();
    }
    
    // Add global lighting
    this.createLighting();
    
    // Create skybox
    this.createSkybox();
  }
  
  /**
   * Create arena level layout
   */
  createArenaLevel() {
    // Create floor
    const floor = this.entityFactory.createPlane({
      width: 50,
      height: 50,
      color: 0x555555
    });
    floor.addTag('level').addTag('floor');
    
    // Create outer walls
    this.createOuterWalls(25, 5, 1);
    
    // Create obstacles
    const obstaclePositions = [
      { x: 5, y: 1, z: 5 },
      { x: -5, y: 1, z: -5 },
      { x: 10, y: 1, z: -7 },
      { x: -10, y: 1, z: 7 },
      { x: 8, y: 1.5, z: -3 }
    ];
    
    obstaclePositions.forEach((pos, index) => {
      // Alternate between box and sphere obstacles
      if (index % 2 === 0) {
        const box = this.entityFactory.createCube({
          position: new THREE.Vector3(pos.x, pos.y, pos.z),
          size: 2,
          color: 0x444444,
          mass: 0 // Static obstacle
        });
        box.addTag('level').addTag('obstacle');
      } else {
        const sphere = this.entityFactory.createSphere({
          position: new THREE.Vector3(pos.x, pos.y, pos.z),
          radius: 1,
          color: 0x444444,
          mass: 0 // Static obstacle
        });
        sphere.addTag('level').addTag('obstacle');
      }
    });
  }
  
  /**
   * Create narrow level layout
   */
  createNarrowLevel() {
    // Create floor
    const floor = this.entityFactory.createPlane({
      width: 50,
      height: 50,
      color: 0x555555
    });
    floor.addTag('level').addTag('floor');
    
    // Create outer walls
    this.createOuterWalls(25, 5, 1);
    
    // Create maze-like corridors
    const corridorWalls = [
      // Horizontal corridors
      { x: 0, y: 2.5, z: -10, width: 30, height: 5, depth: 1 },
      { x: 0, y: 2.5, z: 10, width: 30, height: 5, depth: 1 },
      
      // Vertical corridors
      { x: -10, y: 2.5, z: 0, width: 1, height: 5, depth: 20 },
      { x: 10, y: 2.5, z: 0, width: 1, height: 5, depth: 20 },
      
      // Inner walls
      { x: -5, y: 2.5, z: 5, width: 10, height: 5, depth: 1 },
      { x: 5, y: 2.5, z: -5, width: 10, height: 5, depth: 1 }
    ];
    
    corridorWalls.forEach(wall => {
      const cube = this.entityFactory.createCube({
        position: new THREE.Vector3(wall.x, wall.y, wall.z),
        size: 1, // Will be scaled
        color: 0x666666,
        mass: 0 // Static obstacle
      });
      
      // Scale to create walls
      cube.object3D.scale.set(wall.width, wall.height, wall.depth);
      
      cube.addTag('level').addTag('wall');
    });
  }
  
  /**
   * Create open level layout
   */
  createOpenLevel() {
    // Create larger floor
    const floor = this.entityFactory.createPlane({
      width: 100,
      height: 100,
      color: 0x555555
    });
    floor.addTag('level').addTag('floor');
    
    // Create outer walls (larger)
    this.createOuterWalls(50, 5, 1);
    
    // Create sparse obstacles
    const obstaclePositions = [
      { x: 15, y: 2, z: 15 },
      { x: -15, y: 2, z: -15 },
      { x: 25, y: 3, z: -20 },
      { x: -25, y: 3, z: 20 },
      { x: 0, y: 4, z: -30 }
    ];
    
    obstaclePositions.forEach(pos => {
      const size = Math.random() * 3 + 2; // Random size between 2-5
      
      const box = this.entityFactory.createCube({
        position: new THREE.Vector3(pos.x, pos.y, pos.z),
        size: size,
        color: 0x444444,
        mass: 0 // Static obstacle
      });
      box.addTag('level').addTag('obstacle');
    });
  }
  
  /**
   * Create multi-level layout
   */
  createMultiLevelLevel() {
    // Create floor
    const floor = this.entityFactory.createPlane({
      width: 50,
      height: 50,
      color: 0x555555
    });
    floor.addTag('level').addTag('floor');
    
    // Create outer walls
    this.createOuterWalls(25, 10, 1); // Higher walls
    
    // Create platforms at different heights
    const platforms = [
      { x: -10, y: 2, z: -10, width: 10, height: 0.5, depth: 10 },
      { x: 10, y: 4, z: 10, width: 10, height: 0.5, depth: 10 },
      { x: 10, y: 6, z: -10, width: 10, height: 0.5, depth: 10 },
      { x: -10, y: 8, z: 10, width: 10, height: 0.5, depth: 10 }
    ];
    
    platforms.forEach(platform => {
      const cube = this.entityFactory.createCube({
        position: new THREE.Vector3(platform.x, platform.y, platform.z),
        size: 1, // Will be scaled
        color: 0x666666,
        mass: 0 // Static obstacle
      });
      
      // Scale to create platform
      cube.object3D.scale.set(platform.width, platform.height, platform.depth);
      
      cube.addTag('level').addTag('platform');
    });
    
    // Create ramps
    const ramps = [
      { x: -5, y: 1, z: -5, width: 10, height: 0.5, depth: 10, rotation: new THREE.Euler(Math.PI * 0.1, 0, 0) },
      { x: 5, y: 3, z: 5, width: 10, height: 0.5, depth: 10, rotation: new THREE.Euler(0, 0, Math.PI * 0.1) }
    ];
    
    ramps.forEach(ramp => {
      const cube = this.entityFactory.createCube({
        position: new THREE.Vector3(ramp.x, ramp.y, ramp.z),
        size: 1, // Will be scaled
        color: 0x777777,
        mass: 0 // Static obstacle
      });
      
      // Scale and rotate to create ramp
      cube.object3D.scale.set(ramp.width, ramp.height, ramp.depth);
      cube.object3D.rotation.copy(ramp.rotation);
      
      cube.addTag('level').addTag('ramp');
    });
  }
  
  /**
   * Create outer walls for level boundary
   * @param {number} size - Half size of the arena
   * @param {number} height - Wall height
   * @param {number} thickness - Wall thickness
   */
  createOuterWalls(size, height, thickness) {
    const wallPositions = [
      // North wall
      { x: 0, y: height / 2, z: -size, width: size * 2, height: height, depth: thickness },
      // South wall
      { x: 0, y: height / 2, z: size, width: size * 2, height: height, depth: thickness },
      // East wall
      { x: size, y: height / 2, z: 0, width: thickness, height: height, depth: size * 2 },
      // West wall
      { x: -size, y: height / 2, z: 0, width: thickness, height: height, depth: size * 2 }
    ];
    
    wallPositions.forEach(wall => {
      const cube = this.entityFactory.createCube({
        position: new THREE.Vector3(wall.x, wall.y, wall.z),
        size: 1, // Will be scaled
        color: 0x666666,
        mass: 0 // Static obstacle
      });
      
      // Scale to create walls
      cube.object3D.scale.set(wall.width, wall.height, wall.depth);
      
      cube.addTag('level').addTag('wall');
    });
  }
  
  /**
   * Create global lighting
   */
  createLighting() {
    // Create ambient light
    const ambient = this.entityFactory.createLight({
      type: 'ambient',
      intensity: 0.5,
      color: 0x404040
    });
    ambient.addTag('global').addTag('light');
    
    // Create main directional light (sun)
    const sun = this.entityFactory.createLight({
      type: 'directional',
      position: new THREE.Vector3(10, 30, 10),
      intensity: 1.0,
      castShadow: true,
      shadowMapSize: 2048,
      shadowCameraNear: 0.5,
      shadowCameraFar: 50,
      shadowCameraLeft: -30,
      shadowCameraRight: 30,
      shadowCameraTop: 30,
      shadowCameraBottom: -30
    });
    sun.addTag('global').addTag('light');
    
    // Add some point lights for atmosphere
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const positions = [
      new THREE.Vector3(10, 2, 10),
      new THREE.Vector3(-10, 2, 10),
      new THREE.Vector3(10, 2, -10),
      new THREE.Vector3(-10, 2, -10)
    ];
    
    for (let i = 0; i < colors.length; i++) {
      const light = this.entityFactory.createLight({
        type: 'point',
        position: positions[i],
        color: colors[i],
        intensity: 0.5,
        distance: 20,
        castShadow: false
      });
      light.addTag('level').addTag('light');
    }
  }
  
  /**
   * Create skybox
   */
  createSkybox() {
    // Create a default skybox if texture available
    const hasTexture = this.engine.assetManager.textures.has('skybox');
    
    if (hasTexture) {
      const skybox = this.entityFactory.createSkybox({
        textureId: 'skybox',
        size: 500
      });
      skybox.addTag('global').addTag('skybox');
    } else {
      // Create a simple color background
      this.world.scene.background = new THREE.Color(0x000011);
    }
  }
  
  /**
   * Create player entity
   */
  createPlayer() {
    // Create camera position
    const position = new THREE.Vector3(0, 2, 0);
    
    // Create player entity
    const player = this.world.createEntity();
    player.addTag('player');
    
    // Add components
    player.addComponent(new TransformComponent(position))
          .addComponent(new PhysicsComponent())
          .addComponent(new HealthComponent(100));
    
    // Configure physics
    const physics = player.getComponent(PhysicsComponent);
    physics.collisionShape = 'sphere';
    physics.collisionRadius = 0.5;
    physics.mass = 10;
    
    // Configure health
    const health = player.getComponent(HealthComponent);
    health.onDamaged = (amount, source) => {
      this.updateHealthUI(health.currentHealth, health.maxHealth);
      
      // Flash screen red when damaged
      this.flashDamageIndicator();
    };
    
    health.onDeath = (source) => {
      // Handle player death
      this.handlePlayerDeath();
    };
    
    // Store player entity
    this.player = player;
    
    // Register as singleton
    this.world.registerSingleton(player, 'player');
    
    // Set camera as child of player
    if (this.engine.camera) {
      // Adjust camera position
      this.engine.camera.position.set(0, 1.7, 0); // Eye height
      
      player.object3D.add(this.engine.camera);
    }
  }
  
  /**
   * Create enemies
   * @param {string} levelId - Level identifier
   */
  createEnemies(levelId) {
    // Different spawn configurations based on level
    let spawnCount = 0;
    let spawnRadius = 0;
    
    switch (levelId) {
      case 'arena':
        spawnCount = 10;
        spawnRadius = 15;
        break;
      case 'narrow':
        spawnCount = 15;
        spawnRadius = 20;
        break;
      case 'open':
        spawnCount = 20;
        spawnRadius = 40;
        break;
      case 'multi':
        spawnCount = 12;
        spawnRadius = 20;
        break;
      default:
        spawnCount = 10;
        spawnRadius = 15;
    }
    
    // Create spawn positions
    for (let i = 0; i < spawnCount; i++) {
      // Random position within spawn radius
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnRadius * 0.8 + spawnRadius * 0.2;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = 1;
      
      // Create enemy
      this.createEnemy(new THREE.Vector3(x, y, z));
    }
  }
  
  /**
   * Create a single enemy
   * @param {THREE.Vector3} position - Spawn position
   */
  createEnemy(position) {
    // Create enemy entity
    const enemy = this.world.createEntity();
    enemy.addTag('enemy');
    
    // Create geometry
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    // Add components
    enemy.addComponent(new TransformComponent(position))
         .addComponent(new MeshComponent(geometry, material))
         .addComponent(new PhysicsComponent())
         .addComponent(new HealthComponent(30));
    
    // Configure physics
    const physics = enemy.getComponent(PhysicsComponent);
    physics.collisionShape = 'sphere';
    physics.collisionRadius = 0.5;
    physics.mass = 5;
    
    // Configure health
    const health = enemy.getComponent(HealthComponent);
    health.onDeath = (source) => {
      // Increment score
      this.gameState.score += 100;
      this.gameState.enemiesKilled += 1;
      
      // Update score display
      this.updateScoreUI();
      
      // Create death effect
      this.createEnemyDeathEffect(enemy.object3D.position);
    };
    
    return enemy;
  }
  
  /**
   * Create enemy death effect
   * @param {THREE.Vector3} position - Effect position
   */
  createEnemyDeathEffect(position) {
    // Create explosion-like particle effect
    const particleCount = 30;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true
    });
    
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // All particles start at the explosion center
      particlePositions[i3] = position.x;
      particlePositions[i3 + 1] = position.y;
      particlePositions[i3 + 2] = position.z;
      
      // Random velocity direction
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      
      velocity.normalize().multiplyScalar(Math.random() * 5 + 2);
      particleVelocities.push(velocity);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.world.scene.add(particles);
    
    // Add a point light at the explosion
    const explosionLight = new THREE.PointLight(0xff6600, 2, 5);
    explosionLight.position.copy(position);
    this.world.scene.add(explosionLight);
    
    // Remove effect after a short time
    let lifetime = 0.8;
    const update = (deltaTime) => {
      lifetime -= deltaTime;
      
      // Update particle positions
      const positions = particleGeometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        positions[i3] += particleVelocities[i].x * deltaTime;
        positions[i3 + 1] += particleVelocities[i].y * deltaTime;
        positions[i3 + 2] += particleVelocities[i].z * deltaTime;
        
        // Apply gravity
        particleVelocities[i].y -= 9.8 * deltaTime;
      }
      
      particleGeometry.attributes.position.needsUpdate = true;
      
      // Fade out the explosion light
      explosionLight.intensity = Math.max(0, explosionLight.intensity - deltaTime * 3);
      
      // Remove when lifetime expires
      if (lifetime <= 0) {
        this.world.scene.remove(particles);
        this.world.scene.remove(explosionLight);
        return true; // Done updating
      }
      
      return false; // Continue updating
    };
    
    // Add to update list
    const updateInterval = setInterval(() => {
      if (update(1/60)) {
        clearInterval(updateInterval);
      }
    }, 1000/60);
  }
  
  /**
   * Update player movement from input state
   * @param {number} deltaTime - Time since last update
   */
  updatePlayerMovement(deltaTime) {
    if (!this.player || !this.engine.controls) return;
    
    const transform = this.player.getComponent(TransformComponent);
    const physics = this.player.getComponent(PhysicsComponent);
    
    if (!transform || !physics) return;
    
    // Get input state
    const input = this.engine.inputState;
    
    // Get camera direction
    const camera = this.engine.camera;
    
    if (!camera) return;
    
    // Calculate movement direction based on camera orientation
    const moveDir = new THREE.Vector3();
    
    // Forward/backward movement (z-axis)
    if (input.forward) moveDir.z -= 1;
    if (input.backward) moveDir.z += 1;
    
    // Left/right movement (x-axis)
    if (input.left) moveDir.x -= 1;
    if (input.right) moveDir.x += 1;
    
    // Normalize if we're moving in multiple directions
    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      
      // Apply sprint multiplier
      if (input.sprint) {
        moveDir.multiplyScalar(10.0); // Run speed
      } else {
        moveDir.multiplyScalar(5.0); // Walk speed
      }
      
      // Convert to world space based on camera
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0; // Keep movement horizontal
      cameraDirection.normalize();
      
      // Calculate right vector
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection).normalize();
      
      // Calculate final movement in world space
      const movement = new THREE.Vector3();
      movement.addScaledVector(cameraDirection, -moveDir.z); // Forward is -z
      movement.addScaledVector(right, moveDir.x);
      
      // Apply movement to physics
      physics.velocity.x = movement.x;
      physics.velocity.z = movement.z;
    } else {
      // Slow down if no input
      physics.velocity.x *= 0.8;
      physics.velocity.z *= 0.8;
    }
    
    // Handle jump
    if (input.jump && Math.abs(physics.velocity.y) < 0.1) {
      physics.velocity.y = 7.0; // Jump force
    }
    
    // Handle shooting
    if (input.primaryFire) {
      this.handleShooting(deltaTime);
    }
    
    // Handle weapon switching
    if (input.weaponSwitch !== null) {
      this.switchWeapon(input.weaponSwitch);
      // Reset weapon switch input
      this.engine.inputState.weaponSwitch = null;
    }
  }
  
  /**
   * Handle player shooting
   * @param {number} deltaTime - Time since last update
   */
  handleShooting(deltaTime) {
    // Check if we have ammo
    if (this.gameState.playerAmmo <= 0) {
      // Auto-reload if no ammo
      this.reloadWeapon();
      return;
    }
    
    // Get camera for direction
    const camera = this.engine.camera;
    
    if (!camera) return;
    
    // Create projectile
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // Create projectile entity
    const projectile = this.entityFactory.createProjectile({
      position: new THREE.Vector3().copy(camera.position).addScaledVector(direction, 1.0),
      direction: direction,
      speed: 30,
      size: 0.1,
      color: 0x00ffff,
      damage: 10,
      team: 1 // Player team
    });
    
    // Reduce ammo
    this.gameState.playerAmmo--;
    
    // Update UI
    this.updateAmmoUI();
  }
  
  /**
   * Reload current weapon
   */
  reloadWeapon() {
    // Check if we have reserve ammo
    if (this.gameState.playerAmmoReserve <= 0) return;
    
    // Calculate ammo to reload
    const maxAmmo = 30; // Magazine size
    const neededAmmo = maxAmmo - this.gameState.playerAmmo;
    const availableAmmo = Math.min(neededAmmo, this.gameState.playerAmmoReserve);
    
    // Transfer ammo
    this.gameState.playerAmmo += availableAmmo;
    this.gameState.playerAmmoReserve -= availableAmmo;
    
    // Update UI
    this.updateAmmoUI();
  }
  
  /**
   * Switch to a different weapon
   * @param {number} weaponIndex - Weapon index
   */
  switchWeapon(weaponIndex) {
    const weapons = ['pistol', 'rifle', 'shotgun', 'rocket', 'railgun'];
    
    if (weaponIndex >= 0 && weaponIndex < weapons.length) {
      this.gameState.currentWeapon = weapons[weaponIndex];
      
      // Update UI
      this.updateWeaponUI();
    }
  }
  
  /**
   * Update health UI
   * @param {number} current - Current health
   * @param {number} max - Maximum health
   */
  updateHealthUI(current, max) {
    const healthFill = document.getElementById('health-fill');
    const healthText = document.getElementById('health-text');
    
    if (healthFill) {
      const healthPercent = Math.max(0, current / max * 100);
      healthFill.style.width = `${healthPercent}%`;
      
      // Change color based on health
      if (healthPercent > 60) {
        healthFill.style.backgroundColor = '#00cc00';
      } else if (healthPercent > 30) {
        healthFill.style.backgroundColor = '#ffcc00';
      } else {
        healthFill.style.backgroundColor = '#ff0000';
      }
    }
    
    if (healthText) {
      healthText.textContent = `${Math.ceil(current)}/${max}`;
    }
  }
  
  /**
   * Update ammo UI
   */
  updateAmmoUI() {
    const ammoDisplay = document.getElementById('ammo-display');
    
    if (ammoDisplay) {
      ammoDisplay.textContent = `${this.gameState.playerAmmo} / ${this.gameState.playerAmmoReserve}`;
    }
  }
  
  /**
   * Update score UI
   */
  updateScoreUI() {
    const scoreDisplay = document.getElementById('score-display');
    
    if (scoreDisplay) {
      scoreDisplay.textContent = `Score: ${this.gameState.score}`;
    }
  }
  
  /**
   * Update weapon UI
   */
  updateWeaponUI() {
    const weaponDisplay = document.getElementById('weapon-display');
    
    if (weaponDisplay) {
      // Format weapon name
      const name = this.gameState.currentWeapon.charAt(0).toUpperCase() + 
                   this.gameState.currentWeapon.slice(1);
      weaponDisplay.textContent = name;
    }
  }
  
  /**
   * Update all UI elements
   * @param {number} deltaTime - Time since last update
   */
  updateUI(deltaTime) {
    // Only update occasionally to avoid performance impact
    this.uiUpdateTimer = (this.uiUpdateTimer || 0) + deltaTime;
    
    if (this.uiUpdateTimer > 0.1) { // Update every 100ms
      this.uiUpdateTimer = 0;
      
      // Update player health
      if (this.player) {
        const health = this.player.getComponent(HealthComponent);
        if (health) {
          this.updateHealthUI(health.currentHealth, health.maxHealth);
        }
      }
      
      // Update ammo
      this.updateAmmoUI();
      
      // Update score
      this.updateScoreUI();
    }
  }
  
  /**
   * Flash the damage indicator when player takes damage
   */
  flashDamageIndicator() {
    // Create or get damage overlay
    let damageOverlay = document.getElementById('damage-overlay');
    
    if (!damageOverlay) {
      damageOverlay = document.createElement('div');
      damageOverlay.id = 'damage-overlay';
      damageOverlay.style.position = 'absolute';
      damageOverlay.style.top = '0';
      damageOverlay.style.left = '0';
      damageOverlay.style.width = '100%';
      damageOverlay.style.height = '100%';
      damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
      damageOverlay.style.pointerEvents = 'none';
      damageOverlay.style.transition = 'background-color 0.1s ease-in, background-color 0.5s ease-out';
      document.body.appendChild(damageOverlay);
    }
    
    // Flash red
    damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    
    // Fade out
    setTimeout(() => {
      damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0)';
    }, 100);
  }
  
  /**
   * Handle player death
   */
  handlePlayerDeath() {
    // Transition to game over state
    this.engine.stateMachine.transitionTo('menu', { 
      menuType: 'gameOver',
      score: this.gameState.score
    });
  }
  
  /**
   * Update game state
   * @param {number} deltaTime - Time since last update
   */
  updateGameState(deltaTime) {
    // Update level time
    this.gameState.levelTime += deltaTime;
    
    // Check for enemies
    const enemies = this.world.getEntitiesByTag('enemy');
    
    // If all enemies are defeated, spawn more or end level
    if (enemies.size === 0) {
      // Spawn more enemies or complete level
      if (this.gameState.enemiesKilled < 30) {
        this.spawnEnemyWave();
      } else {
        // Level complete!
        this.handleLevelComplete();
      }
    }
  }
  
  /**
   * Spawn a new wave of enemies
   */
  spawnEnemyWave() {
    const waveSize = 5;
    const spawnRadius = 20;
    
    // Create spawn positions
    for (let i = 0; i < waveSize; i++) {
      // Random position within spawn radius
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * spawnRadius * 0.8 + spawnRadius * 0.2;
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = 1;
      
      // Create enemy
      this.createEnemy(new THREE.Vector3(x, y, z));
    }
  }
  
  /**
   * Handle level completion
   */
  handleLevelComplete() {
    // Show level complete message
    this.showLevelComplete();
    
    // Transition to next level or main menu after delay
    setTimeout(() => {
      this.engine.stateMachine.transitionTo('menu', { menuType: 'levelSelect' });
    }, 3000);
  }
  
  /**
   * Show level complete message
   */
  showLevelComplete() {
    // Create level complete overlay
    const overlay = document.createElement('div');
    overlay.id = 'level-complete';
    overlay.style.position = 'absolute';
    overlay.style.top = '30%';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.textAlign = 'center';
    overlay.style.color = 'white';
    overlay.style.fontSize = '48px';
    overlay.style.fontWeight = 'bold';
    overlay.style.textShadow = '0 0 10px rgba(0, 255, 255, 0.8)';
    overlay.style.pointerEvents = 'none';
    overlay.textContent = 'LEVEL COMPLETE!';
    
    document.body.appendChild(overlay);
    
    // Remove after delay
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 3000);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // We already have the state machine reference from onEnter
    
    // Get start button if still using the HTML interface
    const startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.addEventListener('click', this.handleStartButtonClick = () => {
        // Hide the start screen when clicking the start button
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
          startScreen.style.display = 'none';
        }
      });
    }
    
    // Listen for pointer lock changes
    document.addEventListener('pointerlockchange', this.handlePointerLockChange = () => {
      if (!document.pointerLockElement && this.engine.isRunning) {
        // Pointer was unlocked, pause the game
        this.stateMachine.transitionTo('menu', { menuType: 'pause', engine: this.engine });
      }
    });
    
    // Listen for key events
    document.addEventListener('keydown', this.handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        // Pause game
        this.stateMachine.transitionTo('menu', { menuType: 'pause', engine: this.engine });
      } else if (e.code === 'KeyR') {
        // Reload weapon
        this.reloadWeapon();
      }
    });
  }
  
  /**
   * Remove event listeners
   */
  removeEventListeners() {
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Remove start button listener if it was added
    if (this.handleStartButtonClick) {
      const startButton = document.getElementById('start-button');
      if (startButton) {
        startButton.removeEventListener('click', this.handleStartButtonClick);
      }
    }
  }
}