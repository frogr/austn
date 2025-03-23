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
    
    // Add takeDamage method to enemy
    enemy.takeDamage = (amount, sourcePosition) => {
      this.damageEnemy(enemy, amount);
    };
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
    
    // Create or update health bar
    this.updateEnemyHealthBar(enemy);
    
    // Check if enemy is dead
    if (enemy.health <= 0) {
      this.killEnemy(enemy);
    }
  }
  
  /**
   * Create or update an enemy's health bar
   * @param {THREE.Object3D} enemy - The enemy to update health bar for
   */
  updateEnemyHealthBar(enemy) {
    // Only show health bar if enemy has taken damage
    if (enemy.health >= enemy.maxHealth) {
      // Remove health bar if it exists and enemy is at full health
      if (enemy.healthBar) {
        enemy.remove(enemy.healthBar);
        enemy.healthBar = null;
      }
      return;
    }
    
    // If enemy doesn't have a health bar yet, create one
    if (!enemy.healthBar) {
      // Create health bar container
      const healthBarGroup = new THREE.Group();
      healthBarGroup.position.y = 2.2; // Position above enemy
      
      // Health bar background
      const bgGeometry = new THREE.PlaneGeometry(1.2, 0.2);
      const bgMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        transparent: true,
        opacity: 0.5
      });
      const background = new THREE.Mesh(bgGeometry, bgMaterial);
      healthBarGroup.add(background);
      
      // Health bar foreground (actual health)
      const fgGeometry = new THREE.PlaneGeometry(1.0, 0.1);
      fgGeometry.translate(0, 0, 0.01); // Slightly in front of background
      const fgMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8
      });
      const foreground = new THREE.Mesh(fgGeometry, fgMaterial);
      healthBarGroup.add(foreground);
      
      // Add health bar to enemy
      enemy.add(healthBarGroup);
      
      // Store references
      enemy.healthBar = healthBarGroup;
      enemy.healthBarFg = foreground;
      enemy.healthBarMaterial = fgMaterial;
    }
    
    // Update health bar
    if (enemy.healthBarFg) {
      // Calculate health percentage
      const healthPercent = enemy.health / enemy.maxHealth;
      
      // Scale health bar width based on health percentage
      enemy.healthBarFg.scale.x = healthPercent;
      
      // Position bar to grow from left to right
      enemy.healthBarFg.position.x = (healthPercent - 1) * 0.5;
      
      // Update color based on health percentage
      if (healthPercent < 0.3) {
        enemy.healthBarMaterial.color.setHex(0xff0000); // Red for low health
      } else if (healthPercent < 0.6) {
        enemy.healthBarMaterial.color.setHex(0xffff00); // Yellow for medium health
      } else {
        enemy.healthBarMaterial.color.setHex(0x00ff00); // Green for high health
      }
    }
    
    // Always face the health bar toward the camera
    if (enemy.healthBar && this.player && this.player.camera) {
      // Update on next frame to ensure player position is current
      setTimeout(() => {
        if (enemy.healthBar) {
          const lookDirection = new THREE.Vector3();
          lookDirection.subVectors(enemy.healthBar.getWorldPosition(new THREE.Vector3()), 
                                  this.player.camera.position).normalize();
          
          // Calculate the rotation to face the camera
          const quaternion = new THREE.Quaternion();
          quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), lookDirection);
          enemy.healthBar.setRotationFromQuaternion(quaternion);
        }
      }, 0);
    }
  }
  
  /**
   * Kill an enemy
   * @param {THREE.Object3D} enemy - The enemy to kill
   */
  killEnemy(enemy) {
    enemy.isDead = true;
    
    // Remove health bar if it exists
    if (enemy.healthBar) {
      enemy.remove(enemy.healthBar);
      enemy.healthBar = null;
    }
    
    // Play death animation/effects
    this.createDeathEffect(enemy);
    
    // Remove collision but keep the visual for the death animation
    this.gameWorld.removeEnemy(enemy);
  }
  
  /**
   * Create a death effect for an enemy
   * @param {THREE.Object3D} enemy - The enemy to create death effect for
   */
  createDeathEffect(enemy) {
    const position = enemy.position.clone();
    const enemyColor = enemy.material.color.getHex();
    
    // Start disintegration effect
    const disintegrateDuration = 1.5; // seconds
    let disintegrateTime = 0;
    
    // Add glowing effect
    enemy.material.emissive = new THREE.Color(enemyColor);
    enemy.material.emissiveIntensity = 0.5;
    
    // Create explosion particles around the enemy
    const particleCount = 40;
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: enemyColor,
      size: 0.3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true
    });
    
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Distribute particles on the enemy's surface
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 2 * enemy.radius,
        (Math.random() - 0.5) * 2 * enemy.radius,
        (Math.random() - 0.5) * 2 * enemy.radius
      );
      
      particlePositions[i3] = position.x + offset.x;
      particlePositions[i3 + 1] = position.y + offset.y;
      particlePositions[i3 + 2] = position.z + offset.z;
      
      // Random velocity direction outward
      const velocity = offset.clone().normalize();
      velocity.multiplyScalar(Math.random() * 5 + 2);
      particleVelocities.push(velocity);
      
      // Random sizes
      particleSizes[i] = Math.random() * 0.3 + 0.1;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.gameWorld.scene.add(particles);
    
    // Add shockwave ring effect
    const ringGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.rotation.x = Math.PI / 2; // Align with ground
    this.gameWorld.scene.add(ring);
    
    // Add a point light at the explosion
    const explosionLight = new THREE.PointLight(enemyColor, 3, 8);
    explosionLight.position.copy(position.clone().add(new THREE.Vector3(0, 1, 0)));
    this.gameWorld.scene.add(explosionLight);
    
    // Create smaller mesh fragments for a disintegration effect
    const fragments = [];
    const fragmentCount = 15;
    
    for (let i = 0; i < fragmentCount; i++) {
      // Create a small fragment using the enemy's geometry/material
      const fragmentGeometry = new THREE.SphereGeometry(enemy.radius * 0.3 * Math.random() + 0.1, 8, 8);
      const fragmentMaterial = enemy.material.clone();
      fragmentMaterial.transparent = true;
      fragmentMaterial.opacity = 0.9;
      
      const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
      
      // Position fragment within the enemy's body
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * enemy.radius,
        (Math.random() - 0.5) * enemy.radius,
        (Math.random() - 0.5) * enemy.radius
      );
      
      fragment.position.copy(position.clone().add(offset));
      
      // Add velocity
      const velocity = offset.clone().normalize();
      velocity.multiplyScalar(Math.random() * 3 + 1);
      fragment.velocity = velocity;
      
      // Add rotation
      fragment.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      fragment.rotationSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      );
      
      // Add to scene and fragment list
      this.gameWorld.scene.add(fragment);
      fragments.push(fragment);
    }
    
    // Start animation loop
    const animate = () => {
      disintegrateTime += 1/60;
      const progress = disintegrateTime / disintegrateDuration;
      
      // Update enemy disintegration
      if (enemy) {
        // Scale down enemy as it disintegrates
        enemy.scale.set(
          Math.max(0.01, 1 - progress * 1.5),
          Math.max(0.01, 1 - progress * 1.5),
          Math.max(0.01, 1 - progress * 1.5)
        );
        
        // Make enemy transparent as it disappears
        if (enemy.material) {
          enemy.material.transparent = true;
          enemy.material.opacity = Math.max(0, 1 - progress * 2);
          enemy.material.emissiveIntensity = Math.min(2, enemy.material.emissiveIntensity + 0.05);
        }
        
        // Add y-axis rise to the enemy as it disintegrates
        enemy.position.y += 0.03;
        
        // Add a slight rotation for effect
        enemy.rotation.y += 0.02;
      }
      
      // Update particles
      const positions = particleGeometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        positions[i3] += particleVelocities[i].x * 0.016;
        positions[i3 + 1] += particleVelocities[i].y * 0.016;
        positions[i3 + 2] += particleVelocities[i].z * 0.016;
        
        // Slow down particles over time
        particleVelocities[i].multiplyScalar(0.98);
        
        // Apply gravity
        particleVelocities[i].y -= 0.05;
      }
      
      particleGeometry.attributes.position.needsUpdate = true;
      
      // Update ring expansion
      ring.scale.set(
        1 + progress * 10,
        1 + progress * 10,
        1 + progress * 10
      );
      
      // Make ring transparent as it expands
      ringMaterial.opacity = Math.max(0, 0.7 - progress);
      
      // Update fragments
      for (const fragment of fragments) {
        // Move fragment
        fragment.position.add(fragment.velocity.clone().multiplyScalar(0.016));
        
        // Apply gravity
        fragment.velocity.y -= 0.05;
        
        // Apply rotation
        fragment.rotation.x += fragment.rotationSpeed.x * 0.016;
        fragment.rotation.y += fragment.rotationSpeed.y * 0.016;
        fragment.rotation.z += fragment.rotationSpeed.z * 0.016;
        
        // Make fragments fade out
        fragment.material.opacity = Math.max(0, 1 - progress * 1.2);
      }
      
      // Update explosion light
      explosionLight.intensity = Math.max(0, 3 - progress * 6);
      
      // Continue animation or clean up when done
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Remove all objects
        this.gameWorld.scene.remove(enemy);
        this.gameWorld.scene.remove(particles);
        this.gameWorld.scene.remove(ring);
        this.gameWorld.scene.remove(explosionLight);
        
        for (const fragment of fragments) {
          this.gameWorld.scene.remove(fragment);
        }
      }
    };
    
    // Start animation
    animate();
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