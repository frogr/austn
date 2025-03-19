import * as THREE from 'three';

/**
 * Manages enemy spawning, behavior, and AI
 */
export class EnemyManager {
  constructor(gameWorld, player) {
    this.gameWorld = gameWorld;
    this.player = player;
    
    // Enemy settings
    this.maxEnemies = 10;
    this.spawnInterval = 3000; // ms
    this.spawnTimer = 0;
    this.isSpawning = false;
    
    // Enemy types
    this.enemyTypes = [
      {
        name: 'grunt',
        health: 30,
        damage: 10,
        speed: 3.0,
        attackRange: 10,
        attackCooldown: 1.0,
        color: 0xff0000,
        scale: 1.0
      },
      {
        name: 'heavy',
        health: 75,
        damage: 15,
        speed: 1.5,
        attackRange: 15,
        attackCooldown: 2.0,
        color: 0xff4500,
        scale: 1.5
      },
      {
        name: 'scout',
        health: 15,
        damage: 5,
        speed: 5.0,
        attackRange: 8,
        attackCooldown: 0.5,
        color: 0xff8c00,
        scale: 0.8
      }
    ];
  }
  
  /**
   * Start enemy spawning
   */
  startSpawning() {
    this.isSpawning = true;
    this.spawnTimer = this.spawnInterval;
  }
  
  /**
   * Stop enemy spawning
   */
  stopSpawning() {
    this.isSpawning = false;
  }
  
  /**
   * Update enemy spawning and behavior
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Handle enemy spawning
    if (this.isSpawning) {
      this.spawnTimer -= deltaTime * 1000;
      
      if (this.spawnTimer <= 0) {
        this.spawnEnemy();
        this.spawnTimer = this.spawnInterval;
      }
    }
    
    // Update all enemies
    for (const enemy of this.gameWorld.enemies) {
      this.updateEnemy(enemy, deltaTime);
    }
  }
  
  /**
   * Spawn a new enemy
   */
  spawnEnemy() {
    // Don't spawn if we've reached the enemy limit
    if (this.gameWorld.enemies.length >= this.maxEnemies) return;
    
    // Choose a random enemy type
    const enemyType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
    
    // Calculate spawn position (random location around the arena)
    let spawnPosition;
    let attempts = 0;
    
    do {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 5; // 20-25 units from center
      
      spawnPosition = new THREE.Vector3(
        Math.cos(angle) * distance,
        1.0, // Spawn at ground level
        Math.sin(angle) * distance
      );
      
      attempts++;
    } while (!this.isValidSpawnPosition(spawnPosition) && attempts < 10);
    
    // If we couldn't find a valid position after 10 attempts, don't spawn
    if (attempts >= 10) return;
    
    // Create enemy geometry
    const enemyGeometry = new THREE.CapsuleGeometry(enemyType.scale * 0.5, enemyType.scale * 1.0, 4, 8);
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: enemyType.color });
    
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.copy(spawnPosition);
    enemy.castShadow = true;
    enemy.receiveShadow = true;
    
    // Add to scene
    this.gameWorld.scene.add(enemy);
    
    // Store enemy properties
    enemy.health = enemyType.health;
    enemy.maxHealth = enemyType.health;
    enemy.damage = enemyType.damage;
    enemy.speed = enemyType.speed;
    enemy.attackRange = enemyType.attackRange;
    enemy.attackCooldown = enemyType.attackCooldown;
    enemy.lastAttackTime = 0;
    enemy.radius = enemyType.scale * 0.5;
    enemy.isDead = false;
    
    // Register with game world
    this.gameWorld.registerEnemy(enemy);
  }
  
  /**
   * Check if a spawn position is valid
   * @param {THREE.Vector3} position - Position to check
   * @returns {boolean} - Whether the position is valid
   */
  isValidSpawnPosition(position) {
    // Check if position is within arena bounds
    if (!this.gameWorld.isPositionInBounds(position)) {
      return false;
    }
    
    // Check if position is too close to player
    const distanceToPlayer = position.distanceTo(this.player.camera.position);
    if (distanceToPlayer < 10) {
      return false;
    }
    
    // Check if position is too close to other enemies
    for (const enemy of this.gameWorld.enemies) {
      const distanceToEnemy = position.distanceTo(enemy.position);
      if (distanceToEnemy < 2) {
        return false;
      }
    }
    
    // Check collision with world objects
    for (const obj of this.gameWorld.objects) {
      const bbox = new THREE.Box3().setFromObject(obj);
      if (bbox.containsPoint(position)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Update an individual enemy
   * @param {THREE.Object3D} enemy - The enemy to update
   * @param {number} deltaTime - Time since last update
   */
  updateEnemy(enemy, deltaTime) {
    // Skip if enemy is dead
    if (enemy.isDead) return;
    
    // Calculate direction to player
    const directionToPlayer = new THREE.Vector3()
      .subVectors(this.player.camera.position, enemy.position)
      .normalize();
    
    // Calculate distance to player
    const distanceToPlayer = enemy.position.distanceTo(this.player.camera.position);
    
    // Move towards player
    if (distanceToPlayer > 2.0) {
      const movement = directionToPlayer.clone().multiplyScalar(enemy.speed * deltaTime);
      
      // Calculate new position
      const newPosition = enemy.position.clone().add(movement);
      
      // Check if the new position is valid
      if (this.isValidMovementPosition(enemy, newPosition)) {
        enemy.position.copy(newPosition);
      }
    }
    
    // Face the player
    enemy.lookAt(this.player.camera.position);
    
    // Attack if in range
    if (distanceToPlayer <= enemy.attackRange) {
      const currentTime = performance.now() / 1000;
      
      if (currentTime - enemy.lastAttackTime > enemy.attackCooldown) {
        this.enemyAttack(enemy);
        enemy.lastAttackTime = currentTime;
      }
    }
  }
  
  /**
   * Check if a movement position is valid for an enemy
   * @param {THREE.Object3D} enemy - The enemy
   * @param {THREE.Vector3} position - Position to check
   * @returns {boolean} - Whether the position is valid
   */
  isValidMovementPosition(enemy, position) {
    // Check if position is within arena bounds
    if (!this.gameWorld.isPositionInBounds(position)) {
      return false;
    }
    
    // Check collision with world objects
    for (const obj of this.gameWorld.objects) {
      // Don't collide with self
      if (obj === enemy) continue;
      
      const bbox = new THREE.Box3().setFromObject(obj);
      
      // Expand bbox by enemy radius
      bbox.expandByScalar(enemy.radius);
      
      if (bbox.containsPoint(position)) {
        return false;
      }
    }
    
    // Check collision with other enemies
    for (const otherEnemy of this.gameWorld.enemies) {
      // Don't collide with self
      if (otherEnemy === enemy) continue;
      
      const distance = position.distanceTo(otherEnemy.position);
      if (distance < enemy.radius + otherEnemy.radius) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Handle enemy attack
   * @param {THREE.Object3D} enemy - The attacking enemy
   */
  enemyAttack(enemy) {
    // Create projectile from enemy towards player
    const direction = new THREE.Vector3()
      .subVectors(this.player.camera.position, enemy.position)
      .normalize();
    
    // Add some randomness to enemy aim
    const randomSpread = 0.1;
    direction.x += (Math.random() - 0.5) * randomSpread;
    direction.y += (Math.random() - 0.5) * randomSpread;
    direction.z += (Math.random() - 0.5) * randomSpread;
    direction.normalize();
    
    // Create projectile
    this.gameWorld.createProjectile(
      enemy.position.clone().add(new THREE.Vector3(0, 1.0, 0)), // Shoot from the enemy's "head"
      direction,
      30.0, // Speed
      enemy.damage,
      2 // Team 2 = enemies
    );
  }
  
  /**
   * Apply damage to an enemy
   * @param {THREE.Object3D} enemy - The enemy to damage
   * @param {number} amount - Damage amount
   */
  damageEnemy(enemy, amount) {
    // Check if enemy is already dead
    if (enemy.isDead) return;
    
    // Apply damage
    enemy.health -= amount;
    
    // Check if enemy is dead
    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }
  
  /**
   * Kill an enemy
   * @param {THREE.Object3D} enemy - The enemy to kill
   */
  killEnemy(enemy) {
    enemy.isDead = true;
    
    // Play death animation/effects
    this.createDeathEffect(enemy.position.clone());
    
    // Remove after a short delay
    setTimeout(() => {
      this.gameWorld.scene.remove(enemy);
      this.gameWorld.removeEnemy(enemy);
    }, 100);
  }
  
  /**
   * Create a death effect at the given position
   * @param {THREE.Vector3} position - Position for the effect
   */
  createDeathEffect(position) {
    // Create explosion particles
    const particleCount = 30;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff5500,
      size: 0.3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true
    });
    
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // All particles start at the death position
      particlePositions[i3] = position.x;
      particlePositions[i3 + 1] = position.y;
      particlePositions[i3 + 2] = position.z;
      
      // Random velocity direction
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10 + 5, // Add upward bias
        (Math.random() - 0.5) * 10
      );
      
      velocity.normalize().multiplyScalar(Math.random() * 7 + 3);
      particleVelocities.push(velocity);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.gameWorld.scene.add(particles);
    
    // Add a point light at the explosion
    const explosionLight = new THREE.PointLight(0xff5500, 3, 8);
    explosionLight.position.copy(position);
    this.gameWorld.scene.add(explosionLight);
    
    // Remove effect after animation
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
      explosionLight.intensity = Math.max(0, explosionLight.intensity - deltaTime * 5);
      
      // Remove when lifetime expires
      if (lifetime <= 0) {
        this.gameWorld.scene.remove(particles);
        this.gameWorld.scene.remove(explosionLight);
        return true; // Done updating
      }
      
      return false; // Continue updating
    };
    
    // Add to update list (simplified - in a real game you'd use an entity system)
    const updateInterval = setInterval(() => {
      if (update(1/60)) {
        clearInterval(updateInterval);
      }
    }, 1000/60);
  }
  
  /**
   * Clean up all enemies
   */
  cleanupEnemies() {
    for (const enemy of this.gameWorld.enemies.slice()) {
      this.gameWorld.scene.remove(enemy);
      this.gameWorld.removeEnemy(enemy);
    }
  }
}