import * as THREE from 'three';
import { Component } from '../core/Component.js';

/**
 * Component for entity position, rotation, and scale
 */
export class TransformComponent extends Component {
  constructor(position = new THREE.Vector3(), rotation = new THREE.Euler(), scale = new THREE.Vector3(1, 1, 1)) {
    super();
    this.position = position.clone();
    this.rotation = rotation.clone();
    this.scale = scale.clone();
    this.quaternion = new THREE.Quaternion().setFromEuler(this.rotation);
  }
  
  onAttach() {
    // Set initial transform on entity's Object3D
    const obj = this.entity.object3D;
    obj.position.copy(this.position);
    obj.rotation.copy(this.rotation);
    obj.scale.copy(this.scale);
  }
  
  /**
   * Set position from vector or components
   * @param {THREE.Vector3|number} x - Vector3 or x component
   * @param {number} y - y component
   * @param {number} z - z component
   * @returns {TransformComponent} - Returns this for chaining
   */
  setPosition(x, y, z) {
    if (x instanceof THREE.Vector3) {
      this.position.copy(x);
    } else {
      this.position.set(x, y, z);
    }
    
    this.entity.object3D.position.copy(this.position);
    return this;
  }
  
  /**
   * Set rotation from euler or components
   * @param {THREE.Euler|number} x - Euler or x component
   * @param {number} y - y component
   * @param {number} z - z component
   * @returns {TransformComponent} - Returns this for chaining
   */
  setRotation(x, y, z) {
    if (x instanceof THREE.Euler) {
      this.rotation.copy(x);
    } else {
      this.rotation.set(x, y, z);
    }
    
    this.quaternion.setFromEuler(this.rotation);
    this.entity.object3D.rotation.copy(this.rotation);
    return this;
  }
  
  /**
   * Set quaternion
   * @param {THREE.Quaternion} quaternion - Quaternion
   * @returns {TransformComponent} - Returns this for chaining
   */
  setQuaternion(quaternion) {
    this.quaternion.copy(quaternion);
    this.rotation.setFromQuaternion(this.quaternion);
    this.entity.object3D.quaternion.copy(this.quaternion);
    return this;
  }
  
  /**
   * Set scale from vector or components
   * @param {THREE.Vector3|number} x - Vector3 or x component
   * @param {number} y - y component
   * @param {number} z - z component
   * @returns {TransformComponent} - Returns this for chaining
   */
  setScale(x, y, z) {
    if (x instanceof THREE.Vector3) {
      this.scale.copy(x);
    } else if (typeof y === 'undefined' && typeof z === 'undefined') {
      // Single number for uniform scale
      this.scale.set(x, x, x);
    } else {
      this.scale.set(x, y, z);
    }
    
    this.entity.object3D.scale.copy(this.scale);
    return this;
  }
  
  /**
   * Look at a target position
   * @param {THREE.Vector3} target - Target position
   * @returns {TransformComponent} - Returns this for chaining
   */
  lookAt(target) {
    this.entity.object3D.lookAt(target);
    this.rotation.copy(this.entity.object3D.rotation);
    this.quaternion.copy(this.entity.object3D.quaternion);
    return this;
  }
}