import * as THREE from 'three';
import { 
  GameEngine, 
  AssetManager, 
  EntityFactory,
  StateMachine,
  LoadingState,
  MenuState,
  PlayingState
} from './engine/index.js';

/**
 * Main game class
 */
export class ArenaShooterGame {
  constructor() {
    // Game container
    this.container = null;
    
    // Engine
    this.engine = null;
    
    // Asset manager
    this.assetManager = null;
    
    // Entity factory
    this.entityFactory = null;
    
    // State machine
    this.stateMachine = null;
    
    // Debug mode
    this.debugMode = false;
  }
  
  /**
   * Initialize the game
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Game options
   * @returns {Promise<ArenaShooterGame>} - This game instance
   */
  async initialize(container, options = {}) {
    // Store container
    this.container = container;
    
    // Create asset manager
    this.assetManager = new AssetManager();
    
    // Create game engine
    this.engine = new GameEngine();
    
    // Add debug mode
    this.debugMode = options.debugMode || false;
    this.engine.debugMode = this.debugMode;
    
    // Initialize engine
    await this.engine.initialize(container, {
      antialias: options.antialias !== undefined ? options.antialias : true,
      shadows: options.shadows !== undefined ? options.shadows : true,
      debugMode: this.debugMode
    });
    
    // Set engine asset manager
    this.engine.assetManager = this.assetManager;
    
    // Create entity factory
    this.entityFactory = new EntityFactory(this.engine.world, this.assetManager);
    this.engine.entityFactory = this.entityFactory;
    
    // Create state machine
    this.stateMachine = new StateMachine();
    this.engine.stateMachine = this.stateMachine;
    
    // Register states
    this.registerGameStates();
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Prepare asset manifest
    const assetManifest = this.createAssetManifest();
    
    // Start with loading state
    this.stateMachine.start({
      engine: this.engine,
      assetManifest,
      onComplete: () => {
        // After loading, transition to main menu
        this.stateMachine.transitionTo('menu', { 
          engine: this.engine,
          menuType: 'main'
        });
      }
    });
    
    return this;
  }
  
  /**
   * Register game states
   */
  registerGameStates() {
    // Register loading state with name as the default state
    this.stateMachine.addState(new LoadingState(), true);
    
    // Register menu state
    this.stateMachine.addState(new MenuState());
    
    // Register playing state
    this.stateMachine.addState(new PlayingState());
  }
  
  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // State machine transitions
    this.stateMachine.on('transition', (data) => {
      console.log(`State transition: ${data.from} -> ${data.to}`);
    });
    
    // Window events
    window.addEventListener('blur', () => {
      // Pause game if it loses focus
      if (this.engine.isRunning && this.stateMachine.currentState &&
          this.stateMachine.currentState.name === 'playing') {
        this.stateMachine.transitionTo('menu', { 
          engine: this.engine,
          menuType: 'pause'
        });
      }
    });
    
    // Prevent context menu on right-click
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  /**
   * Create asset manifest
   * @returns {Object} - Asset manifest
   */
  createAssetManifest() {
    return {
      // Remove textures since they're causing 404 errors
      textures: [],
      materials: [
        {
          id: 'floor',
          type: 'MeshStandardMaterial',
          properties: {
            // Remove map reference since we don't have textures
            roughness: 0.8,
            metalness: 0.2,
            color: 0x808080
          }
        }
      ],
      models: [],
      sounds: []
    };
  }
  
  /**
   * Start the game
   */
  start() {
    // Start the engine
    this.engine.start();
  }
  
  /**
   * Pause the game
   */
  pause() {
    // Pause the engine
    this.engine.pause();
  }
  
  /**
   * Resume the game
   */
  resume() {
    // Resume the engine
    this.engine.resume();
  }
  
  /**
   * Stop the game
   */
  stop() {
    // Stop the engine
    this.engine.stop();
  }
}

/**
 * Initialize game
 */
export function initGame(containerId = 'game-container') {
  // Immediately initialize without waiting for DOMContentLoaded
  console.log('Initializing Arena Shooter game...');
  
  // Get container
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with ID "${containerId}" not found`);
    return;
  }
  
  // Create game
  const game = new ArenaShooterGame();
  
  // Store game reference on window immediately
  window.arenaShooterGame = game;
  
  // Initialize and return promise
  return game.initialize(container, {
    antialias: true,
    shadows: true,
    debugMode: true // Enable debug mode
  }).then(() => {
    // Start game engine
    game.start();
    console.log('Arena Shooter game initialized and started');
    
    return game;
  }).catch(error => {
    console.error('Failed to initialize game:', error);
  });
}