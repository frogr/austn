/**
 * ECS module exports
 */

// Core components
export { Entity, Component, System, World, EventEmitter } from './core/index.js';

// Components
export { 
  TransformComponent,
  MeshComponent,
  PhysicsComponent,
  HealthComponent
} from './components/index.js';

// Systems
export {
  PhysicsSystem,
  RenderSystem,
  HealthSystem
} from './systems/index.js';