// Arena Shooter game entry point
import { Application } from './games/arena_shooter/core/Application';
import { AssetManager } from './games/arena_shooter/core/AssetManager';
import { InputManager } from './games/arena_shooter/core/InputManager';
import { UIManager } from './games/arena_shooter/core/UIManager';
import { GameWorld } from './games/arena_shooter/core/GameWorld';
import { Player } from './games/arena_shooter/core/Player';
import { EnemyManager } from './games/arena_shooter/core/EnemyManager';
import { WeaponSystem } from './games/arena_shooter/core/WeaponSystem';

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize loading screen
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar');
  const gameOverScreen = document.getElementById('game-over-screen');
  const restartButton = document.getElementById('restart-button');
  
  // Setup game restart functionality
  restartButton.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    
    // If there's an existing application running, stop it first
    if (window.currentApp) {
      window.currentApp.dispose();
      window.currentApp = null;
    }
    
    startGame();
  });
  
  async function startGame() {
    // Show loading screen
    loadingScreen.style.display = 'flex';
    loadingBar.style.width = '0%';
    
    let app = null;
    let assetManager = null;
    
    try {
      console.log('Starting game initialization...');
      
      // Initialize asset manager and load assets
      assetManager = new AssetManager();
      console.log('Asset manager initialized');
      
      try {
        await assetManager.loadAssets((progress) => {
          loadingBar.style.width = `${progress * 100}%`;
        });
        console.log('Assets loaded successfully');
      } catch (assetError) {
        console.warn('Some assets failed to load, but continuing with fallbacks:', assetError);
        // Continue with initialization despite asset loading errors
      }
      
      // Initialize core systems
      const inputManager = new InputManager();
      const uiManager = new UIManager();
      console.log('Input and UI managers initialized');
      
      // Initialize game world
      const gameWorld = new GameWorld(assetManager);
      try {
        await gameWorld.initialize();
        console.log('Game world initialized');
      } catch (worldError) {
        console.warn('Error initializing game world, but continuing:', worldError);
        // Continue with initialization despite game world errors
      }
      
      // Initialize player
      const player = new Player(gameWorld, inputManager, uiManager);
      console.log('Player initialized');
      
      // Initialize enemy manager
      const enemyManager = new EnemyManager(gameWorld, player);
      console.log('Enemy manager initialized');
      
      // Initialize weapon system
      const weaponSystem = new WeaponSystem(gameWorld, player, assetManager);
      console.log('Weapon system initialized');
      
      // Initialize game application
      app = new Application({
        container: document.getElementById('arena-shooter-container'),
        gameWorld,
        player,
        enemyManager,
        weaponSystem,
        inputManager,
        uiManager,
        assetManager
      });
      console.log('Game application initialized');
      
      // Hide loading screen
      loadingScreen.style.display = 'none';
      
      // Wait for user to click start button before starting the game
      uiManager.on('gameStart', () => {
        // Request pointer lock to enable camera controls
        inputManager.requestPointerLock();
        
        // Start game loop
        app.start();
        
        // Store the app reference globally for restart functionality
        window.currentApp = app;
        
        console.log('Game started');
      });
      
      // Handle game over
      uiManager.on('gameOver', (score) => {
        document.getElementById('final-score').textContent = `Score: ${score}`;
        gameOverScreen.classList.remove('hidden');
        if (app) app.stop();
      });
      
      // Handle window close/navigation
      window.addEventListener('beforeunload', () => {
        if (app) app.dispose();
        if (assetManager) assetManager.dispose();
      });
      
      // Handle arena-shooter:dispose event (when leaving the page via Turbolinks)
      window.addEventListener('arena-shooter:dispose', () => {
        console.log('Disposing game resources');
        if (app) app.dispose();
        if (assetManager) assetManager.dispose();
      });
      
    } catch (error) {
      console.error('Fatal error starting game:', error);
      
      // Display error message on loading screen instead of an alert
      loadingBar.style.width = '100%';
      loadingBar.style.backgroundColor = '#ff3333';
      
      const loadingText = document.querySelector('#loading-screen h2');
      if (loadingText) {
        loadingText.textContent = 'Error Loading Game';
      }
      
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'There was a problem starting the game. Check the console for details.';
      errorMessage.style.color = 'white';
      errorMessage.style.marginTop = '16px';
      
      const retryButton = document.createElement('button');
      retryButton.textContent = 'Retry';
      retryButton.style.marginTop = '16px';
      retryButton.style.padding = '8px 16px';
      retryButton.style.backgroundColor = '#ffcc00';
      retryButton.style.color = 'black';
      retryButton.style.border = 'none';
      retryButton.style.borderRadius = '4px';
      retryButton.style.cursor = 'pointer';
      
      retryButton.addEventListener('click', () => {
        // Remove error message and retry button
        while (loadingScreen.childNodes.length > 1) {
          loadingScreen.removeChild(loadingScreen.lastChild);
        }
        
        // Reset loading text and bar
        if (loadingText) {
          loadingText.textContent = 'Loading Game...';
        }
        loadingBar.style.backgroundColor = '#FFD700';
        
        // Retry starting the game
        startGame();
      });
      
      // Add error message and retry button to loading screen
      loadingScreen.appendChild(errorMessage);
      loadingScreen.appendChild(retryButton);
    }
  }
  
  // Start the game
  startGame();
});