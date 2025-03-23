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
  console.log('Arena Shooter initializing - CRITICAL FIX VERSION');
  
  // Create debug display
  createDebugDisplay();
  
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
  
  // Create a debug display with better visibility for tracking movement and camera issues
  function createDebugDisplay() {
    const debugOverlay = document.createElement('div');
    debugOverlay.id = 'fps-debug-overlay';
    debugOverlay.style.position = 'fixed';
    debugOverlay.style.bottom = '10px';
    debugOverlay.style.right = '10px';
    debugOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugOverlay.style.color = 'lime';
    debugOverlay.style.padding = '8px';
    debugOverlay.style.fontFamily = 'monospace';
    debugOverlay.style.fontSize = '12px';
    debugOverlay.style.zIndex = '1000';
    debugOverlay.style.pointerEvents = 'none';
    debugOverlay.style.borderRadius = '4px';
    debugOverlay.style.maxWidth = '300px';
    debugOverlay.textContent = 'FPS: --';
    
    // Add FPS counter to the page
    document.body.appendChild(debugOverlay);
    
    // Add control hints overlay
    const controlsOverlay = document.createElement('div');
    controlsOverlay.id = 'controls-overlay';
    controlsOverlay.style.position = 'fixed';
    controlsOverlay.style.top = '10px';
    controlsOverlay.style.left = '10px';
    controlsOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    controlsOverlay.style.color = 'white';
    controlsOverlay.style.padding = '10px';
    controlsOverlay.style.fontFamily = 'monospace';
    controlsOverlay.style.fontSize = '12px';
    controlsOverlay.style.zIndex = '1000';
    controlsOverlay.style.pointerEvents = 'none';
    controlsOverlay.style.borderRadius = '4px';
    controlsOverlay.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px; color: lime;">CONTROLS</div>
      <div>WASD: Move</div>
      <div>Mouse: Look</div>
      <div>Click: Shoot</div>
      <div>ESC: Release mouse</div>
    `;
    
    document.body.appendChild(controlsOverlay);
    
    // Update FPS display
    let lastTime = performance.now();
    let frames = 0;
    
    function updateFPS() {
      if (!window.currentApp) return;
      
      frames++;
      
      const now = performance.now();
      const elapsed = now - lastTime;
      
      // Update FPS once per second
      if (elapsed >= 1000) {
        const fps = Math.round(frames * 1000 / elapsed);
        debugOverlay.textContent = `FPS: ${fps}`;
        
        // Add player info if available
        const player = window.currentApp.player;
        const inputManager = window.currentApp.inputManager;
        
        if (player && player.camera) {
          const pos = player.camera.position;
          debugOverlay.textContent += `\nPos: ${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
          
          if (player.velocity) {
            const vel = player.velocity;
            const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
            debugOverlay.textContent += `\nSpeed: ${speed.toFixed(1)} m/s`;
          }
        }
        
        if (inputManager) {
          debugOverlay.textContent += `\nPointer lock: ${inputManager.pointerLocked ? 'ACTIVE' : 'INACTIVE'}`;
        }
        
        lastTime = now;
        frames = 0;
      }
      
      requestAnimationFrame(updateFPS);
    }
    
    // Start the FPS counter
    updateFPS();
  }

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
        inputManager.handleClick();
        
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