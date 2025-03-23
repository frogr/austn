import * as THREE from 'three';

/**
 * Manages the game world, including the scene, environment, physics, and game objects
 */
export class GameWorld {
  constructor(assetManager) {
    this.assetManager = assetManager;
    
    // Create the THREE.js scene
    this.scene = new THREE.Scene();
    
    // Fog for distant objects
    this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
    
    // Physics objects
    this.objects = [];
    this.colliders = [];
    
    // Initialize physics properties
    this.gravity = -9.8;
    
    // Keep track of enemies
    this.enemies = [];
    
    // Projectiles
    this.projectiles = [];
    
    // Team mappings (1 = player, 2 = enemies)
    this.teamMappings = new Map();
    
    // Reference to player (set during Application initialization)
    this.player = null;
    
    // Reference to weapon system (set during Application initialization)
    this.weaponSystem = null;
  }
  
  /**
   * Initialize the game world
   */
  async initialize() {
    // Add lighting
    this.setupLighting();
    
    // Create the environment
    this.createEnvironment();
    
    // Add ambient audio
    this.setupAudio();
    
    return this;
  }
  
  /**
   * Set up lighting in the scene
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
    this.scene.add(ambientLight);
    
    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunLight.position.set(10, 30, 10);
    sunLight.castShadow = true;
    
    // Configure shadow properties
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    
    this.scene.add(sunLight);
    
    // Add point lights for atmosphere
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const positions = [
      new THREE.Vector3(10, 2, 10),
      new THREE.Vector3(-10, 2, 10),
      new THREE.Vector3(10, 2, -10),
      new THREE.Vector3(-10, 2, -10)
    ];
    
    for (let i = 0; i < colors.length; i++) {
      const pointLight = new THREE.PointLight(colors[i], 0.5, 20);
      pointLight.position.copy(positions[i]);
      this.scene.add(pointLight);
    }
  }
  
  /**
   * Create the game environment (arena, floors, walls, etc.)
   */
  createEnvironment() {
    // Create skybox
    if (this.assetManager.textures.has('skybox')) {
      const skyboxTexture = this.assetManager.getAsset('texture', 'skybox');
      const skyboxGeometry = new THREE.SphereGeometry(500, 60, 40);
      // Flip the geometry inside out
      skyboxGeometry.scale(-1, 1, 1);
      
      const skyboxMaterial = new THREE.MeshBasicMaterial({
        map: skyboxTexture
      });
      
      const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
      this.scene.add(skybox);
    }
    
    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = this.assetManager.getAsset('material', 'floor') || 
                         new THREE.MeshStandardMaterial({ color: 0x808080 });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    
    this.scene.add(floor);
    this.colliders.push(floor);
    
    // Create outer walls
    const wallMaterial = this.assetManager.getAsset('material', 'wall') || 
                        new THREE.MeshStandardMaterial({ color: 0x808080 });
    
    // Wall dimensions
    const wallHeight = 5;
    const wallThickness = 1;
    const arenaSize = 50;
    
    // Create walls
    const walls = [
      // North wall
      { pos: [0, wallHeight / 2, -arenaSize / 2], size: [arenaSize, wallHeight, wallThickness] },
      // South wall
      { pos: [0, wallHeight / 2, arenaSize / 2], size: [arenaSize, wallHeight, wallThickness] },
      // East wall
      { pos: [arenaSize / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, arenaSize] },
      // West wall
      { pos: [-arenaSize / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, arenaSize] }
    ];
    
    walls.forEach(wall => {
      const wallGeometry = new THREE.BoxGeometry(wall.size[0], wall.size[1], wall.size[2]);
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      
      wallMesh.position.set(wall.pos[0], wall.pos[1], wall.pos[2]);
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      
      this.scene.add(wallMesh);
      this.colliders.push(wallMesh);
    });
    
    // Add some obstacles for cover
    const obstaclePositions = [
      [5, 1, 5],
      [-5, 1, -5],
      [10, 1, -7],
      [-10, 1, 7],
      [0, 1.5, 0]
    ];
    
    obstaclePositions.forEach((pos, index) => {
      // Alternate between box and cylinder obstacles
      let obstacle;
      
      if (index % 2 === 0) {
        const boxGeometry = new THREE.BoxGeometry(2, pos[1] * 2, 2);
        obstacle = new THREE.Mesh(boxGeometry, new THREE.MeshStandardMaterial({ color: 0x555555 }));
      } else {
        const cylinderGeometry = new THREE.CylinderGeometry(1, 1, pos[1] * 2, 16);
        obstacle = new THREE.Mesh(cylinderGeometry, new THREE.MeshStandardMaterial({ color: 0x444444 }));
      }
      
      obstacle.position.set(pos[0], pos[1], pos[2]);
      obstacle.castShadow = true;
      obstacle.receiveShadow = true;
      
      this.scene.add(obstacle);
      this.colliders.push(obstacle);
      this.objects.push(obstacle);
    });
  }
  
  /**
   * Set up ambient audio for the game world
   */
  setupAudio() {
    // Create an audio listener
    this.audioListener = new THREE.AudioListener();
    
    // Create ambient sound
    this.ambientSound = new THREE.Audio(this.audioListener);
    
    // We would load actual ambient audio here, but we'll skip for this example
  }
  
  /**
   * Update the game world
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Update projectiles
    this.updateProjectiles(deltaTime);
    
    // Update enemies
    this.updateEnemies(deltaTime);
  }
  
  /**
   * Update all projectiles
   * @param {number} deltaTime - Time since last update
   */
  updateProjectiles(deltaTime) {
    // Move each projectile
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Update position
      projectile.position.add(projectile.velocity.clone().multiplyScalar(deltaTime));
      
      // Update lifetime
      projectile.lifetime -= deltaTime;
      
      // Remove if lifetime expired
      if (projectile.lifetime <= 0) {
        this.scene.remove(projectile);
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check for collisions with world
      const raycaster = new THREE.Raycaster(
        projectile.previousPosition,
        projectile.velocity.clone().normalize(),
        0,
        projectile.previousPosition.distanceTo(projectile.position)
      );
      
      const intersects = raycaster.intersectObjects(this.colliders);
      
      if (intersects.length > 0) {
        // Hit a world object
        const hitPoint = intersects[0].point;
        
        // Handle rocket explosion with splash damage
        if (projectile.projectileType === 'rocket' && projectile.splashDamage && projectile.splashRadius) {
          // Use custom explosion effect if available
          if (typeof projectile.onImpact === 'function') {
            projectile.onImpact(hitPoint);
          } else {
            this.createExplosion(hitPoint, projectile.splashRadius);
          }
          
          this.applyAreaDamage(
            hitPoint, 
            projectile.splashRadius, 
            projectile.splashDamage,
            projectile.team
          );
        } else {
          // Regular impact effect for bullets
          this.createImpactEffect(hitPoint);
        }
        
        // Remove projectile
        this.scene.remove(projectile);
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check for collisions with entities
      let hitEntity = null;
      
      // Check if projectile hit enemies (only if fired by player)
      if (projectile.team === 1) {
        for (const enemy of this.enemies) {
          // Simple sphere collision check
          const distance = enemy.position.distanceTo(projectile.position);
          if (distance < enemy.radius) {
            hitEntity = enemy;
            
            // If not penetrating, stop at the first hit enemy
            if (!projectile.penetrating) {
              break;
            }
          }
        }
      }
      
      if (hitEntity) {
        // Apply damage to the entity
        if (typeof hitEntity.takeDamage === 'function') {
          hitEntity.takeDamage(projectile.damage);
        }
        
        // Create impact effect
        this.createImpactEffect(projectile.position.clone());
        
        // For rockets, also create explosion and apply splash damage
        if (projectile.projectileType === 'rocket' && projectile.splashDamage && projectile.splashRadius) {
          this.createExplosion(projectile.position.clone(), projectile.splashRadius);
          this.applyAreaDamage(
            projectile.position.clone(), 
            projectile.splashRadius, 
            projectile.splashDamage,
            projectile.team
          );
        }
        
        // Remove projectile unless it's penetrating
        if (!projectile.penetrating) {
          this.scene.remove(projectile);
          this.projectiles.splice(i, 1);
          continue;
        }
      }
      
      // Update previous position for next frame
      projectile.previousPosition.copy(projectile.position);
    }
  }
  
  /**
   * Update all enemies
   * @param {number} deltaTime - Time since last update
   */
  updateEnemies(deltaTime) {
    // Remove dead enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].isDead) {
        const enemy = this.enemies[i];
        this.scene.remove(enemy);
        this.enemies.splice(i, 1);
      }
    }
  }
  
  /**
   * Create a projectile
   * @param {THREE.Vector3} position - Starting position
   * @param {THREE.Vector3} direction - Direction vector
   * @param {number} speed - Projectile speed
   * @param {number} damage - Damage amount
   * @param {number} team - Team identifier (1=player, 2=enemy)
   * @param {Object} options - Additional projectile options
   * @returns {THREE.Object3D} - The created projectile
   */
  createProjectile(position, direction, speed, damage, team, options = {}) {
    let projectile;
    const projectileType = options.type || 'bullet';
    
    if (projectileType === 'rocket' && options.model) {
      // Use the provided rocket model
      projectile = options.model.clone();
      projectile.position.copy(position);
      
      // Add a rocket trail effect
      const trailLight = new THREE.PointLight(0xff6600, 2, 5);
      projectile.add(trailLight);
      
      // Store callback for explosion effect if provided
      if (typeof options.onImpact === 'function') {
        projectile.onImpact = options.onImpact;
      }
    } else if (projectileType === 'bullet') {
      // Standard bullet projectile
      const color = options.color || (team === 1 ? 0x00ffff : 0xff0000);
      // Make projectiles smaller (0.05 instead of 0.1)
      const scale = options.scale || 1.0;
      const geometry = new THREE.SphereGeometry(0.05 * scale, 8, 8);
      
      // For tracer rounds (sniper rifle), make them longer
      if (options.tracer) {
        geometry.scale(1, 1, 4);
      }
      
      const material = new THREE.MeshBasicMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.8
      });
      
      projectile = new THREE.Mesh(geometry, material);
      projectile.position.copy(position);
      
      // Add a point light to the projectile with reduced intensity
      const light = new THREE.PointLight(color, 0.5, 3);
      light.position.set(0, 0, 0);
      projectile.add(light);
    } else {
      // Default fallback
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: team === 1 ? 0x00ffff : 0xff0000,
        emissive: team === 1 ? 0x00ffff : 0xff0000,
        emissiveIntensity: 2
      });
      
      projectile = new THREE.Mesh(geometry, material);
      projectile.position.copy(position);
    }
    
    // Align the projectile to the direction of travel
    if (projectileType === 'rocket' || options.tracer) {
      // Create a quaternion from the direction vector
      const quaternion = new THREE.Quaternion();
      const upVector = new THREE.Vector3(0, 1, 0);
      
      // Note: lookAt would be easier, but we're setting the quaternion directly
      const matrix = new THREE.Matrix4();
      matrix.lookAt(new THREE.Vector3(), direction, upVector);
      quaternion.setFromRotationMatrix(matrix);
      
      // Apply rotation
      projectile.quaternion.copy(quaternion);
    }
    
    // Store projectile properties
    projectile.velocity = direction.normalize().multiplyScalar(speed);
    projectile.previousPosition = position.clone();
    projectile.lifetime = 2.0; // 2 seconds lifetime
    projectile.damage = damage;
    projectile.team = team;
    
    // Store additional options for special projectile types
    projectile.projectileType = projectileType;
    if (projectileType === 'rocket') {
      projectile.splashDamage = options.splashDamage || 0;
      projectile.splashRadius = options.splashRadius || 0;
    }
    if (options.penetrating) {
      projectile.penetrating = true;
    }
    
    // Add to scene and projectiles array
    this.scene.add(projectile);
    this.projectiles.push(projectile);
    
    return projectile;
  }
  
  /**
   * Create an impact effect at the given position
   * @param {THREE.Vector3} position - Impact position
   */
  createImpactEffect(position) {
    // Create a particle burst effect
    const particleCount = 20;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffff00,
      size: 0.2,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true
    });
    
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // All particles start at the impact position
      particlePositions[i3] = position.x;
      particlePositions[i3 + 1] = position.y;
      particlePositions[i3 + 2] = position.z;
      
      // Random velocity direction
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      
      velocity.normalize().multiplyScalar(Math.random() * 5 + 2);
      particleVelocities.push(velocity);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
    
    // Add a point light at the impact
    const impactLight = new THREE.PointLight(0xffff00, 2, 4);
    impactLight.position.copy(position);
    this.scene.add(impactLight);
    
    // Remove effect after a short time
    let lifetime = 0.5;
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
      
      // Fade out the impact light
      impactLight.intensity = Math.max(0, impactLight.intensity - deltaTime * 4);
      
      // Remove when lifetime expires
      if (lifetime <= 0) {
        this.scene.remove(particles);
        this.scene.remove(impactLight);
        return true; // Done updating
      }
      
      return false; // Continue updating
    };
    
    // Add to update list (this is simplified - in a real game you'd use an entity system)
    const updateInterval = setInterval(() => {
      if (update(1/60)) {
        clearInterval(updateInterval);
      }
    }, 1000/60);
  }
  
  /**
   * Create a larger explosion effect for rockets
   * @param {THREE.Vector3} position - Explosion center
   * @param {number} radius - Explosion radius
   */
  createExplosion(position, radius) {
    // Create a spherical explosion mesh that expands then fades
    const explosionGeometry = new THREE.SphereGeometry(0.1, 32, 32);
    const explosionMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.copy(position);
    this.scene.add(explosion);
    
    // Create a point light at the explosion center
    const explosionLight = new THREE.PointLight(0xff6600, 5, radius * 2);
    explosionLight.position.copy(position);
    this.scene.add(explosionLight);
    
    // Create particles for the explosion
    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff9900,
      size: 0.4,
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
      
      // Random velocity direction (outward)
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      
      velocity.normalize().multiplyScalar(Math.random() * 15 + 5);
      particleVelocities.push(velocity);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
    
    // Explosion animation
    let lifetime = 1.0;
    const maxSize = radius;
    const update = (deltaTime) => {
      lifetime -= deltaTime;
      
      // Expand the explosion sphere
      const size = Math.min(maxSize, (1 - lifetime) * maxSize * 2);
      explosion.scale.set(size, size, size);
      
      // Fade out the explosion as it expands
      explosionMaterial.opacity = Math.max(0, lifetime * 0.8);
      
      // Update particle positions
      const positions = particleGeometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        positions[i3] += particleVelocities[i].x * deltaTime;
        positions[i3 + 1] += particleVelocities[i].y * deltaTime;
        positions[i3 + 2] += particleVelocities[i].z * deltaTime;
        
        // Slow down particles over time
        particleVelocities[i].multiplyScalar(0.95);
      }
      
      particleGeometry.attributes.position.needsUpdate = true;
      
      // Fade out the explosion light
      explosionLight.intensity = Math.max(0, explosionLight.intensity - deltaTime * 5);
      
      // Remove when lifetime expires
      if (lifetime <= 0) {
        this.scene.remove(explosion);
        this.scene.remove(explosionLight);
        this.scene.remove(particles);
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
   * Apply damage to all entities within a radius
   * @param {THREE.Vector3} position - Center position
   * @param {number} radius - Damage radius
   * @param {number} damage - Base damage amount
   * @param {number} sourceTeam - Team that caused the damage
   */
  applyAreaDamage(position, radius, damage, sourceTeam) {
    // Apply damage to enemies in radius (if source is player team)
    if (sourceTeam === 1) {
      for (const enemy of this.enemies) {
        const distance = enemy.position.distanceTo(position);
        
        // Only apply damage if within radius
        if (distance <= radius) {
          // Calculate damage falloff based on distance
          const falloff = 1 - (distance / radius);
          const actualDamage = damage * falloff;
          
          // Apply damage to the enemy
          if (typeof enemy.takeDamage === 'function') {
            enemy.takeDamage(actualDamage, position);
          }
        }
      }
    }
    
    // Apply damage to player if source is enemy team
    if (sourceTeam === 2 && this.player) {
      const distance = this.player.camera.position.distanceTo(position);
      
      // Only apply damage if within radius
      if (distance <= radius) {
        // Calculate damage falloff based on distance
        const falloff = 1 - (distance / radius);
        const actualDamage = damage * falloff;
        
        // Apply damage to player
        if (typeof this.player.takeDamage === 'function') {
          this.player.takeDamage(actualDamage, position);
        }
      }
    }
  }
  
  /**
   * Register an entity with a team
   * @param {THREE.Object3D} entity - The entity to register
   * @param {number} team - Team identifier
   */
  registerEntityTeam(entity, team) {
    this.teamMappings.set(entity.uuid, team);
  }
  
  /**
   * Get the team of an entity
   * @param {THREE.Object3D} entity - The entity
   * @returns {number} - Team identifier
   */
  getEntityTeam(entity) {
    return this.teamMappings.get(entity.uuid) || 0;
  }
  
  /**
   * Register an enemy
   * @param {THREE.Object3D} enemy - The enemy to register
   */
  registerEnemy(enemy) {
    this.enemies.push(enemy);
    this.registerEntityTeam(enemy, 2); // Team 2 is enemies
  }
  
  /**
   * Remove an enemy
   * @param {THREE.Object3D} enemy - The enemy to remove
   */
  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
      this.teamMappings.delete(enemy.uuid);
    }
  }
  
  /**
   * Check if a position is within the arena bounds
   * @param {THREE.Vector3} position - The position to check
   * @returns {boolean} - Whether the position is within bounds
   */
  isPositionInBounds(position) {
    const arenaSize = 25; // Half of the 50x50 arena
    return (
      position.x > -arenaSize && position.x < arenaSize &&
      position.z > -arenaSize && position.z < arenaSize
    );
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Remove all projectiles
    for (const projectile of this.projectiles) {
      this.scene.remove(projectile);
    }
    this.projectiles = [];
    
    // Clear all entity team mappings
    this.teamMappings.clear();
  }
}