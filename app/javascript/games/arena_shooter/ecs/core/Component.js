/**
 * Base Component class for the ECS architecture
 * Components hold data but no logic/behavior
 */
export class Component {
  constructor() {
    this.entity = null;
  }
  
  /**
   * Called when the component is attached to an entity
   * Override in derived classes to perform initialization
   */
  onAttach() {}
  
  /**
   * Called when the component is detached from an entity
   * Override in derived classes to perform cleanup
   */
  onDetach() {}
}