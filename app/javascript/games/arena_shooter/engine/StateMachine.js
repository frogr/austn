import { EventEmitter } from '../ecs/core/EventEmitter.js';

/**
 * State class for the state machine
 */
export class State {
  constructor(name) {
    this.name = name;
  }
  
  /**
   * Called when entering this state
   * @param {StateMachine} stateMachine - The state machine
   * @param {any} prevState - The previous state
   * @param {Object} params - Optional parameters
   */
  onEnter(stateMachine, prevState, params = {}) {}
  
  /**
   * Called when exiting this state
   * @param {StateMachine} stateMachine - The state machine
   * @param {any} nextState - The next state
   */
  onExit(stateMachine, nextState) {}
  
  /**
   * Called to update this state
   * @param {StateMachine} stateMachine - The state machine
   * @param {number} deltaTime - Time since last update
   */
  update(stateMachine, deltaTime) {}
}

/**
 * StateMachine handles transitions between game states
 */
export class StateMachine extends EventEmitter {
  constructor() {
    super();
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
    this.defaultState = null;
    this.context = {};
  }
  
  /**
   * Add a state to the state machine
   * @param {State} state - The state to add
   * @param {boolean} isDefault - Whether this is the default state
   * @returns {StateMachine} - This state machine
   */
  addState(state, isDefault = false) {
    this.states.set(state.name, state);
    
    if (isDefault) {
      this.defaultState = state.name;
    }
    
    return this;
  }
  
  /**
   * Get a state by name
   * @param {string} name - State name
   * @returns {State} - The requested state
   */
  getState(name) {
    return this.states.get(name);
  }
  
  /**
   * Set the context object
   * @param {Object} context - Context object to share with states
   * @returns {StateMachine} - This state machine
   */
  setContext(context) {
    this.context = context;
    return this;
  }
  
  /**
   * Transition to a new state
   * @param {string} stateName - Name of the state to transition to
   * @param {Object} params - Optional parameters to pass to the state
   * @returns {boolean} - Whether the transition succeeded
   */
  transitionTo(stateName, params = {}) {
    // Check if state exists
    if (!this.states.has(stateName)) {
      console.error(`State "${stateName}" does not exist`);
      return false;
    }
    
    // Get new state
    const nextState = this.states.get(stateName);
    
    // Exit current state if one exists
    if (this.currentState) {
      this.previousState = this.currentState;
      this.currentState.onExit(this, nextState);
    }
    
    // Update state reference
    const prevState = this.currentState;
    this.currentState = nextState;
    
    // Enter new state
    this.currentState.onEnter(this, prevState, params);
    
    // Emit transition event
    this.emit('transition', {
      from: prevState ? prevState.name : null,
      to: this.currentState.name,
      params
    });
    
    return true;
  }
  
  /**
   * Start the state machine with the default state
   * @param {Object} params - Optional parameters to pass to the state
   * @returns {boolean} - Whether the start succeeded
   */
  start(params = {}) {
    if (!this.defaultState) {
      console.error('No default state defined');
      return false;
    }
    
    return this.transitionTo(this.defaultState, params);
  }
  
  /**
   * Update the current state
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (this.currentState) {
      this.currentState.update(this, deltaTime);
    }
  }
}