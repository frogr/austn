import * as THREE from 'three';
import { Component } from '../core/Component.js';

/**
 * Component for basic physics properties
 */
export class PhysicsComponent extends Component {
  constructor() {
    super();
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.mass = 1.0;
    this.drag = 0.1;
    this.useGravity = true;
    this.isKinematic = false;
    this.collisionRadius = 0.5;
    this.collisionShape = 'sphere'; // 'sphere', 'box'
    this.boundingBox = new THREE.Box3();
    this.boundingSphere = new THREE.Sphere();
    this.isColliding = false;
    this.collisionResponse = true;
  }
  
  onAttach() {
    // Initialize bounding volumes
    this.updateBounds();
  }
  
  /**
   * Apply a force to this physics body
   * @param {THREE.Vector3} force - Force vector
   * @returns {PhysicsComponent} - Returns this for chaining
   */
  applyForce(force) {
    const accelerationChange = force.clone().divideScalar(this.mass);
    this.acceleration.add(accelerationChange);
    return this;
  }
  
  /**
   * Apply an impulse (immediate velocity change)
   * @param {THREE.Vector3} impulse - Impulse vector
   * @returns {PhysicsComponent} - Returns this for chaining
   */
  applyImpulse(impulse) {
    const velocityChange = impulse.clone().divideScalar(this.mass);
    this.velocity.add(velocityChange);
    return this;
  }
  
  /**
   * Update the bounding volumes based on the entity's mesh
   * @returns {PhysicsComponent} - Returns this for chaining
   */
  updateBounds() {
    if (!this.entity) return this;
    
    // Get the mesh from entity if available
    const meshComponent = this.entity.getComponent('MeshComponent');
    if (meshComponent && meshComponent.mesh) {
      // Update bounding box
      this.boundingBox.setFromObject(meshComponent.mesh);
      
      // Update bounding sphere
      this.boundingSphere.center.copy(this.entity.object3D.position);
      const size = this.boundingBox.getSize(new THREE.Vector3());
      this.boundingSphere.radius = Math.max(size.x, size.y, size.z) * 0.5;
      this.collisionRadius = this.boundingSphere.radius;
    } else {
      // Default bounding volumes
      this.boundingBox.setFromCenterAndSize(
        this.entity.object3D.position,
        new THREE.Vector3(this.collisionRadius * 2, this.collisionRadius * 2, this.collisionRadius * 2)
      );
      this.boundingSphere.center.copy(this.entity.object3D.position);
      this.boundingSphere.radius = this.collisionRadius;
    }
    
    return this;
  }
  
  /**
   * Set the collision radius
   * @param {number} radius - Collision radius
   * @returns {PhysicsComponent} - Returns this for chaining
   */
  setCollisionRadius(radius) {
    this.collisionRadius = radius;
    this.updateBounds();
    return this;
  }
  
  /**
   * Check collision with another physics component
   * @param {PhysicsComponent} other - Other physics component
   * @returns {boolean} - Whether collision occurred
   */
  checkCollision(other) {
    if (this.collisionShape === 'sphere' && other.collisionShape === 'sphere') {
      // Sphere-sphere collision
      const distance = this.entity.object3D.position.distanceTo(other.entity.object3D.position);
      return distance < (this.collisionRadius + other.collisionRadius);
    } else {
      // Box-box collision using bounding boxes
      this.updateBounds();
      other.updateBounds();
      return this.boundingBox.intersectsBox(other.boundingBox);
    }
  }
}