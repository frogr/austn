import * as THREE from 'three';

/**
 * Basic entity in the ECS architecture
 * An entity is just an ID with a list of components
 */
export class Entity {
  constructor(id) {
    this.id = id || crypto.randomUUID();
    this.components = new Map();
    this.tags = new Set();
    this.object3D = new THREE.Group();
    this.object3D.userData.entityId = this.id;
    this.active = true;
  }

  /**
   * Add a component to this entity
   * @param {Component} component - The component to add
   * @returns {Entity} - Returns this entity for chaining
   */
  addComponent(component) {
    this.components.set(component.constructor.name, component);
    component.entity = this;
    component.onAttach();
    return this;
  }

  /**
   * Get a component by type
   * @param {Function} componentType - The component class
   * @returns {Component} - The component or undefined if not found
   */
  getComponent(componentType) {
    if (typeof componentType === 'string') {
      return this.components.get(componentType);
    }
    return this.components.get(componentType.name);
  }

  /**
   * Check if this entity has a component
   * @param {Function} componentType - The component class
   * @returns {boolean} - Whether the entity has the component
   */
  hasComponent(componentType) {
    if (typeof componentType === 'string') {
      return this.components.has(componentType);
    }
    return this.components.has(componentType.name);
  }

  /**
   * Remove a component from this entity
   * @param {Function} componentType - The component class
   * @returns {Entity} - Returns this entity for chaining
   */
  removeComponent(componentType) {
    const name = typeof componentType === 'string' ? componentType : componentType.name;
    const component = this.components.get(name);
    
    if (component) {
      component.onDetach();
      this.components.delete(name);
    }
    
    return this;
  }

  /**
   * Add a tag to this entity
   * @param {string} tag - The tag to add
   * @returns {Entity} - Returns this entity for chaining
   */
  addTag(tag) {
    this.tags.add(tag);
    return this;
  }

  /**
   * Check if this entity has a tag
   * @param {string} tag - The tag to check for
   * @returns {boolean} - Whether the entity has the tag
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }

  /**
   * Remove a tag from this entity
   * @param {string} tag - The tag to remove
   * @returns {Entity} - Returns this entity for chaining
   */
  removeTag(tag) {
    this.tags.delete(tag);
    return this;
  }

  /**
   * Destroy this entity
   */
  destroy() {
    // Call onDetach for all components
    for (const component of this.components.values()) {
      component.onDetach();
    }
    
    // Clear components
    this.components.clear();
    
    // Remove from scene
    if (this.object3D.parent) {
      this.object3D.parent.remove(this.object3D);
    }
    
    // Mark as inactive
    this.active = false;
  }
}