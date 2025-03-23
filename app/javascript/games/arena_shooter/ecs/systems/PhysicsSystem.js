import * as THREE from 'three';
import { System } from '../core/System.js';
import { TransformComponent } from '../components/TransformComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';

/**
 * System that handles physics simulation and collisions
 */
export class PhysicsSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['TransformComponent', 'PhysicsComponent'];
    this.gravity = new THREE.Vector3(0, -9.8, 0);
    this.spatialGrid = null;
    this.collisionPairs = [];
  }
  
  onRegistered() {
    // Initialize spatial grid for collision detection
    this.initSpatialGrid();
  }
  
  /**
   * Initialize spatial grid for collision detection
   */
  initSpatialGrid() {
    // Simple spatial hashing could be implemented here
    // For now, we'll use a naive approach
  }
  
  /**
   * Process a single entity
   * @param {Entity} entity - The entity to process
   * @param {number} deltaTime - Time since last update
   */
  processEntity(entity, deltaTime) {
    const transform = entity.getComponent(TransformComponent);
    const physics = entity.getComponent(PhysicsComponent);
    
    // Skip kinematic bodies for physics simulation
    if (physics.isKinematic) return;
    
    // Apply gravity
    if (physics.useGravity) {
      physics.velocity.add(this.gravity.clone().multiplyScalar(deltaTime));
    }
    
    // Apply acceleration
    physics.velocity.add(physics.acceleration.clone().multiplyScalar(deltaTime));
    
    // Apply drag
    if (physics.drag > 0) {
      physics.velocity.multiplyScalar(1 - physics.drag * deltaTime);
    }
    
    // Update position
    const positionDelta = physics.velocity.clone().multiplyScalar(deltaTime);
    transform.setPosition(transform.position.clone().add(positionDelta));
    
    // Reset acceleration
    physics.acceleration.set(0, 0, 0);
    
    // Update physics bounding volumes
    physics.updateBounds();
  }
  
  /**
   * Generate potential collision pairs
   */
  generateCollisionPairs() {
    this.collisionPairs = [];
    
    // Get all entities with physics components
    const physicsEntities = [];
    for (const entity of this.world.getEntities()) {
      if (entity.active && entity.hasComponent(PhysicsComponent)) {
        physicsEntities.push(entity);
      }
    }
    
    // Generate collision pairs (naive approach)
    for (let i = 0; i < physicsEntities.length; i++) {
      const entityA = physicsEntities[i];
      const physicsA = entityA.getComponent(PhysicsComponent);
      
      if (!physicsA.collisionResponse) continue;
      
      for (let j = i + 1; j < physicsEntities.length; j++) {
        const entityB = physicsEntities[j];
        const physicsB = entityB.getComponent(PhysicsComponent);
        
        if (!physicsB.collisionResponse) continue;
        
        // Add potential collision pair
        this.collisionPairs.push([entityA, entityB]);
      }
    }
  }
  
  /**
   * Resolve collisions
   */
  resolveCollisions() {
    for (const [entityA, entityB] of this.collisionPairs) {
      const physicsA = entityA.getComponent(PhysicsComponent);
      const physicsB = entityB.getComponent(PhysicsComponent);
      
      // Check collision
      if (physicsA.checkCollision(physicsB)) {
        this.resolveCollision(entityA, entityB);
      }
    }
  }
  
  /**
   * Resolve a specific collision
   * @param {Entity} entityA - First entity
   * @param {Entity} entityB - Second entity
   */
  resolveCollision(entityA, entityB) {
    const physicsA = entityA.getComponent(PhysicsComponent);
    const physicsB = entityB.getComponent(PhysicsComponent);
    const transformA = entityA.getComponent(TransformComponent);
    const transformB = entityB.getComponent(TransformComponent);
    
    // Mark entities as colliding
    physicsA.isColliding = true;
    physicsB.isColliding = true;
    
    // Emit collision event
    this.world.scene.dispatchEvent({
      type: 'collision',
      entityA,
      entityB
    });
    
    // Handle collision response for sphere-sphere collisions
    if (physicsA.collisionShape === 'sphere' && physicsB.collisionShape === 'sphere') {
      // Calculate collision normal
      const normal = new THREE.Vector3().subVectors(
        transformB.position,
        transformA.position
      ).normalize();
      
      // Calculate collision depth
      const distance = transformA.position.distanceTo(transformB.position);
      const minDistance = physicsA.collisionRadius + physicsB.collisionRadius;
      const penetrationDepth = minDistance - distance;
      
      // Only separate if penetration exists
      if (penetrationDepth > 0) {
        // Separate entities based on mass
        const totalMass = physicsA.mass + physicsB.mass;
        const ratioA = physicsB.mass / totalMass;
        const ratioB = physicsA.mass / totalMass;
        
        // Move entities apart
        if (!physicsA.isKinematic) {
          transformA.setPosition(
            transformA.position.clone().sub(
              normal.clone().multiplyScalar(penetrationDepth * ratioA)
            )
          );
        }
        
        if (!physicsB.isKinematic) {
          transformB.setPosition(
            transformB.position.clone().add(
              normal.clone().multiplyScalar(penetrationDepth * ratioB)
            )
          );
        }
        
        // Calculate relative velocity
        const relativeVelocity = new THREE.Vector3().subVectors(
          physicsB.velocity,
          physicsA.velocity
        );
        
        // Calculate velocity along normal
        const normalVelocity = relativeVelocity.dot(normal);
        
        // Only resolve if objects are moving toward each other
        if (normalVelocity < 0) {
          // Calculate restitution (bounciness)
          const restitution = 0.5; // Could be derived from material properties
          
          // Calculate impulse scalar
          let j = -(1 + restitution) * normalVelocity;
          j /= 1/physicsA.mass + 1/physicsB.mass;
          
          // Apply impulse
          const impulse = normal.clone().multiplyScalar(j);
          
          if (!physicsA.isKinematic) {
            physicsA.velocity.sub(impulse.clone().divideScalar(physicsA.mass));
          }
          
          if (!physicsB.isKinematic) {
            physicsB.velocity.add(impulse.clone().divideScalar(physicsB.mass));
          }
        }
      }
    }
  }
  
  /**
   * Post update processing
   * @param {number} deltaTime - Time since last update
   */
  postUpdate(deltaTime) {
    // Generate collision pairs
    this.generateCollisionPairs();
    
    // Resolve collisions
    this.resolveCollisions();
    
    // Reset collision flags
    for (const entity of this.world.getEntities()) {
      if (entity.hasComponent(PhysicsComponent)) {
        entity.getComponent(PhysicsComponent).isColliding = false;
      }
    }
  }
}