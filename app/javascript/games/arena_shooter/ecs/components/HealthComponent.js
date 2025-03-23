import { Component } from '../core/Component.js';

/**
 * Component for entity health and damage
 */
export class HealthComponent extends Component {
  constructor(maxHealth = 100) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.isDead = false;
    this.invulnerable = false;
    this.invulnerabilityTimer = 0;
    this.regeneration = 0;
    this.regenerationDelay = 0;
    this.regenerationTimer = 0;
    this.lastDamageSource = null;
    this.lastDamageTime = 0;
    this.onDamaged = null;
    this.onHealed = null;
    this.onDeath = null;
  }
  
  /**
   * Apply damage to this entity
   * @param {number} amount - Damage amount
   * @param {Object} source - Source of the damage
   * @returns {boolean} - Whether damage was applied
   */
  takeDamage(amount, source = null) {
    if (this.invulnerable || this.isDead || amount <= 0) return false;
    
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.lastDamageSource = source;
    this.lastDamageTime = performance.now();
    this.regenerationTimer = this.regenerationDelay;
    
    // Trigger onDamaged event if defined
    if (typeof this.onDamaged === 'function') {
      this.onDamaged(amount, source);
    }
    
    // Check for death
    if (this.currentHealth <= 0 && !this.isDead) {
      this.die();
      return true;
    }
    
    return true;
  }
  
  /**
   * Heal this entity
   * @param {number} amount - Healing amount
   * @returns {boolean} - Whether healing was applied
   */
  heal(amount) {
    if (this.isDead || amount <= 0) return false;
    
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    const actualHealing = this.currentHealth - oldHealth;
    
    // Trigger onHealed event if defined and healing occurred
    if (actualHealing > 0 && typeof this.onHealed === 'function') {
      this.onHealed(actualHealing);
    }
    
    return actualHealing > 0;
  }
  
  /**
   * Kill this entity
   */
  die() {
    if (this.isDead) return;
    
    this.isDead = true;
    this.currentHealth = 0;
    
    // Trigger onDeath event if defined
    if (typeof this.onDeath === 'function') {
      this.onDeath(this.lastDamageSource);
    }
  }
  
  /**
   * Reset health to max
   */
  reset() {
    this.currentHealth = this.maxHealth;
    this.isDead = false;
    this.invulnerable = false;
    this.invulnerabilityTimer = 0;
    this.regenerationTimer = 0;
    this.lastDamageSource = null;
    this.lastDamageTime = 0;
  }
  
  /**
   * Set temporary invulnerability
   * @param {number} duration - Duration in seconds
   */
  setInvulnerable(duration) {
    this.invulnerable = true;
    this.invulnerabilityTimer = duration;
  }
  
  /**
   * Update component
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Update invulnerability
    if (this.invulnerable && this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerable = false;
      }
    }
    
    // Update regeneration
    if (this.regeneration > 0 && !this.isDead && this.currentHealth < this.maxHealth) {
      if (this.regenerationTimer > 0) {
        this.regenerationTimer -= deltaTime;
      } else {
        const healAmount = this.regeneration * deltaTime;
        this.heal(healAmount);
      }
    }
  }
}