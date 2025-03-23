import * as THREE from 'three';
import { Entity } from './Entity.js';

/**
 * World class manages all entities and systems in the ECS architecture
 */
export class World {
  constructor() {
    this.entities = new Map();
    this.systems = [];
    this.scene = new THREE.Scene();
    this.entityFactory = new EntityFactory(this);
    this.singletonEntities = new Map();
    this.tags = new Map(); // Map of tag -> Set of entities
    this.pendingEntities = [];
    this.pendingRemovals = [];
  }
  
  /**
   * Create a new entity
   * @param {string} id - Optional ID for the entity
   * @returns {Entity} - The created entity
   */
  createEntity(id) {
    const entity = new Entity(id);
    this.pendingEntities.push(entity);
    this.scene.add(entity.object3D);
    return entity;
  }
  
  /**
   * Register a singleton entity with a specific type
   * @param {Entity} entity - The entity to register
   * @param {string} type - The singleton type
   */
  registerSingleton(entity, type) {
    this.singletonEntities.set(type, entity);
  }
  
  /**
   * Get a singleton entity by type
   * @param {string} type - The singleton type
   * @returns {Entity} - The singleton entity or undefined
   */
  getSingleton(type) {
    return this.singletonEntities.get(type);
  }
  
  /**
   * Commit pending entities
   * This adds all pending entities to the main entities collection
   */
  commitPendingEntities() {
    for (const entity of this.pendingEntities) {
      this.entities.set(entity.id, entity);
      
      // Add entity to tag collections
      for (const tag of entity.tags) {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set());
        }
        this.tags.get(tag).add(entity);
      }
    }
    
    this.pendingEntities = [];
  }
  
  /**
   * Process entity removals
   */
  processPendingRemovals() {
    for (const entity of this.pendingRemovals) {
      // Remove from all tag collections
      for (const tag of entity.tags) {
        const tagSet = this.tags.get(tag);
        if (tagSet) {
          tagSet.delete(entity);
        }
      }
      
      // Remove from entity collection
      this.entities.delete(entity.id);
      
      // Remove from singletons if it's a singleton
      for (const [type, singleton] of this.singletonEntities.entries()) {
        if (singleton.id === entity.id) {
          this.singletonEntities.delete(type);
        }
      }
    }
    
    this.pendingRemovals = [];
  }
  
  /**
   * Remove an entity from the world
   * @param {Entity} entity - The entity to remove
   */
  removeEntity(entity) {
    if (entity) {
      entity.destroy();
      this.pendingRemovals.push(entity);
    }
  }
  
  /**
   * Get an entity by ID
   * @param {string} id - The entity ID
   * @returns {Entity} - The entity or undefined
   */
  getEntity(id) {
    return this.entities.get(id);
  }
  
  /**
   * Get all entities
   * @returns {Iterator} - Iterator for all entities
   */
  getEntities() {
    return this.entities.values();
  }
  
  /**
   * Get entities with a specific tag
   * @param {string} tag - The tag to filter by
   * @returns {Set<Entity>} - Set of entities with the tag
   */
  getEntitiesByTag(tag) {
    return this.tags.get(tag) || new Set();
  }
  
  /**
   * Register a system with this world
   * @param {System} system - The system to register
   * @returns {System} - The registered system
   */
  registerSystem(system) {
    system.registerWith(this);
    this.systems.push(system);
    
    // Sort systems by priority (higher priority runs first)
    this.systems.sort((a, b) => b.priority - a.priority);
    
    return system;
  }
  
  /**
   * Update all systems
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Process pending additions and removals
    this.commitPendingEntities();
    this.processPendingRemovals();
    
    // Update all systems
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Destroy all entities
    for (const entity of this.entities.values()) {
      entity.destroy();
    }
    
    // Clear collections
    this.entities.clear();
    this.singletonEntities.clear();
    this.tags.clear();
    this.pendingEntities = [];
    this.pendingRemovals = [];
  }
}

/**
 * EntityFactory provides common entity creation patterns
 */
class EntityFactory {
  constructor(world) {
    this.world = world;
  }
  
  // Add factory methods for common entity types here
}