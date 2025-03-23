/**
 * Base System class for the ECS architecture
 * Systems contain the logic that processes entities with specific components
 */
export class System {
  constructor() {
    this.world = null;
    this.requiredComponents = [];
    this.priority = 0;
  }
  
  /**
   * Set the priority of this system (higher runs first)
   * @param {number} priority - Priority value
   * @returns {System} - Returns this system for chaining
   */
  setPriority(priority) {
    this.priority = priority;
    return this;
  }
  
  /**
   * Register this system with a world
   * @param {World} world - The world to register with
   */
  registerWith(world) {
    this.world = world;
    this.onRegistered();
  }
  
  /**
   * Called when the system is registered with a world
   * Override in derived classes to perform initialization
   */
  onRegistered() {}
  
  /**
   * Check if an entity has all required components for this system
   * @param {Entity} entity - The entity to check
   * @returns {boolean} - Whether the entity has all required components
   */
  checkRequirements(entity) {
    return this.requiredComponents.every(componentType => 
      entity.hasComponent(componentType));
  }
  
  /**
   * Process a single entity
   * @param {Entity} entity - The entity to process
   * @param {number} deltaTime - Time since last update
   */
  processEntity(entity, deltaTime) {
    // Override in derived classes
  }
  
  /**
   * Update the system
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (!this.world) return;
    
    // Process all entities that meet requirements
    for (const entity of this.world.getEntities()) {
      if (entity.active && this.checkRequirements(entity)) {
        this.processEntity(entity, deltaTime);
      }
    }
    
    // Additional system-wide processing
    this.postUpdate(deltaTime);
  }
  
  /**
   * Called after processing all entities
   * @param {number} deltaTime - Time since last update
   */
  postUpdate(deltaTime) {
    // Override in derived classes
  }
}