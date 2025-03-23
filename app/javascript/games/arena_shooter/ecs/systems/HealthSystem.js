import { System } from '../core/System.js';
import { HealthComponent } from '../components/HealthComponent.js';

/**
 * System that manages entity health
 */
export class HealthSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['HealthComponent'];
  }
  
  /**
   * Process a single entity
   * @param {Entity} entity - The entity to process
   * @param {number} deltaTime - Time since last update
   */
  processEntity(entity, deltaTime) {
    const health = entity.getComponent(HealthComponent);
    
    // Skip if already dead
    if (health.isDead) return;
    
    // Update health component
    health.update(deltaTime);
    
    // Handle death if health is depleted
    if (health.currentHealth <= 0 && !health.isDead) {
      this.handleEntityDeath(entity);
    }
  }
  
  /**
   * Handle entity death
   * @param {Entity} entity - The entity that died
   */
  handleEntityDeath(entity) {
    const health = entity.getComponent(HealthComponent);
    
    // Mark as dead
    health.isDead = true;
    health.currentHealth = 0;
    
    // Emit death event
    this.world.scene.dispatchEvent({
      type: 'entityDeath',
      entity: entity,
      source: health.lastDamageSource
    });
    
    // Handle different entity types based on tags
    if (entity.hasTag('player')) {
      this.handlePlayerDeath(entity);
    } else if (entity.hasTag('enemy')) {
      this.handleEnemyDeath(entity);
    } else if (entity.hasTag('destructible')) {
      this.handleDestructibleDeath(entity);
    }
  }
  
  /**
   * Handle player death
   * @param {Entity} player - The player entity
   */
  handlePlayerDeath(player) {
    // Emit specific player death event
    this.world.scene.dispatchEvent({
      type: 'playerDeath',
      player: player
    });
  }
  
  /**
   * Handle enemy death
   * @param {Entity} enemy - The enemy entity
   */
  handleEnemyDeath(enemy) {
    // Emit specific enemy death event
    this.world.scene.dispatchEvent({
      type: 'enemyDeath',
      enemy: enemy
    });
    
    // Schedule entity for removal
    // In a real game you might want to play death animation first
    this.world.removeEntity(enemy);
  }
  
  /**
   * Handle destructible object death
   * @param {Entity} destructible - The destructible entity
   */
  handleDestructibleDeath(destructible) {
    // Emit specific destructible death event
    this.world.scene.dispatchEvent({
      type: 'destructibleDeath',
      destructible: destructible
    });
    
    // Schedule entity for removal
    this.world.removeEntity(destructible);
  }
}