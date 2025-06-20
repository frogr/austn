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
    
    // Controls overlay removed - already shown in start screen
    
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
  
  // Create a modal level selection UI that appears after clicking Start Game
  function createLevelSelectUI() {
    const arenaContainer = document.getElementById('arena-shooter-container');
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'level-select-modal';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modalOverlay.style.display = 'none'; // Hidden by default
    modalOverlay.style.flexDirection = 'column';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.zIndex = '1000';
    
    // Create level select container
    const levelSelectContainer = document.createElement('div');
    levelSelectContainer.id = 'level-select-container';
    levelSelectContainer.style.display = 'flex';
    levelSelectContainer.style.flexDirection = 'column';
    levelSelectContainer.style.alignItems = 'center';
    levelSelectContainer.style.backgroundColor = 'rgba(30, 30, 40, 0.9)';
    levelSelectContainer.style.padding = '30px';
    levelSelectContainer.style.borderRadius = '10px';
    levelSelectContainer.style.maxWidth = '600px';
    
    // Create level select heading
    const levelSelectHeading = document.createElement('h3');
    levelSelectHeading.textContent = 'SELECT YOUR ARENA';
    levelSelectHeading.style.color = 'white';
    levelSelectHeading.style.fontSize = '28px';
    levelSelectHeading.style.marginBottom = '25px';
    levelSelectHeading.style.fontFamily = 'monospace';
    
    // Create level options container
    const levelOptions = document.createElement('div');
    levelOptions.style.display = 'flex';
    levelOptions.style.gap = '25px';
    levelOptions.style.marginBottom = '30px';
    
    // Add level options
    const levels = [
      { id: 'empty', name: 'EMPTY ARENA', description: 'Just a floor - practice your movement' },
      { id: 'standard', name: 'STANDARD ARENA', description: 'Walls and obstacles - full game experience' }
    ];
    
    // Create a start level button
    const startLevelButton = document.createElement('button');
    startLevelButton.textContent = 'START';
    startLevelButton.style.padding = '12px 40px';
    startLevelButton.style.backgroundColor = '#4CAF50';
    startLevelButton.style.color = 'white';
    startLevelButton.style.border = 'none';
    startLevelButton.style.borderRadius = '5px';
    startLevelButton.style.fontSize = '18px';
    startLevelButton.style.cursor = 'pointer';
    startLevelButton.style.fontFamily = 'monospace';
    startLevelButton.style.marginTop = '10px';
    startLevelButton.style.transition = 'all 0.2s ease';
    
    startLevelButton.addEventListener('mouseover', () => {
      startLevelButton.style.backgroundColor = '#45a049';
      startLevelButton.style.transform = 'scale(1.05)';
    });
    
    startLevelButton.addEventListener('mouseout', () => {
      startLevelButton.style.backgroundColor = '#4CAF50';
      startLevelButton.style.transform = 'scale(1)';
    });
    
    // Handle starting the selected level
    startLevelButton.addEventListener('click', () => {
      // Hide the modal
      modalOverlay.style.display = 'none';
      
      // Start the game with the selected level
      startSelectedLevel();
    });
    
    levels.forEach(level => {
      const levelCard = document.createElement('div');
      levelCard.className = 'level-card';
      levelCard.dataset.levelId = level.id;
      levelCard.style.width = '220px';
      levelCard.style.padding = '20px';
      levelCard.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      levelCard.style.border = level.id === 'standard' ? '3px solid #6f6' : '3px solid #666';
      levelCard.style.borderRadius = '8px';
      levelCard.style.cursor = 'pointer';
      levelCard.style.transition = 'all 0.2s ease';
      
      const levelName = document.createElement('h4');
      levelName.textContent = level.name;
      levelName.style.color = 'white';
      levelName.style.fontSize = '18px';
      levelName.style.marginBottom = '12px';
      levelName.style.fontFamily = 'monospace';
      
      const levelDesc = document.createElement('p');
      levelDesc.textContent = level.description;
      levelDesc.style.color = '#ccc';
      levelDesc.style.fontSize = '14px';
      levelDesc.style.fontFamily = 'monospace';
      
      // Add click handler
      levelCard.addEventListener('click', () => {
        // Remove selected state from all cards
        document.querySelectorAll('.level-card').forEach(card => {
          card.style.border = '3px solid #666';
        });
        
        // Set selected state on clicked card
        levelCard.style.border = '3px solid #6f6';
        
        // Set selected level
        window.selectedLevel = level.id;
        console.log(`Selected level: ${level.id}`);
      });
      
      // Append elements
      levelCard.appendChild(levelName);
      levelCard.appendChild(levelDesc);
      levelOptions.appendChild(levelCard);
    });
    
    // Append elements
    levelSelectContainer.appendChild(levelSelectHeading);
    levelSelectContainer.appendChild(levelOptions);
    levelSelectContainer.appendChild(startLevelButton);
    modalOverlay.appendChild(levelSelectContainer);
    
    // Add to DOM
    document.body.appendChild(modalOverlay);
    
    // Add global function to show the level select
    window.showLevelSelect = function() {
      console.log('Showing level select');
      // Default selected level
      window.selectedLevel = 'standard';
      
      // Reset selection state of level cards
      setTimeout(() => {
        document.querySelectorAll('.level-card').forEach(card => {
          card.style.border = card.dataset.levelId === 'standard' ? '3px solid #6f6' : '3px solid #666';
        });
      }, 10);
      
      // Show modal
      modalOverlay.style.display = 'flex';
    };
    
    return modalOverlay;
  }
  
  /**
   * Start the selected level
   */
  function startSelectedLevel() {
    // Show loading screen
    loadingScreen.style.display = 'flex';
    loadingBar.style.width = '0%';
    
    // Set up and initialize the game components
    let app = null;
    
    try {
      console.log(`Starting level: ${window.selectedLevel || 'standard'}`);
      
      // Keep asset manager global for reuse across level loads
      if (!window.assetManager) {
        window.assetManager = new AssetManager();
      }
      
      // Keep input manager global for better state management
      if (!window.inputManager) {
        window.inputManager = new InputManager();
      }
      
      // Create UI manager (this doesn't have much state so can be recreated)
      const uiManager = new UIManager();
      
      // Initialize loading sequence
      (async () => {
        try {
          // Load assets if they haven't been loaded already
          if (!window.assetManager.loaded) {
            await window.assetManager.loadAssets((progress) => {
              loadingBar.style.width = `${progress * 100}%`;
            });
          } else {
            // Simulate some loading time for better UX
            loadingBar.style.width = '100%';
          }
          
          // Initialize game world with selected level
          const gameWorld = new GameWorld(window.assetManager, {
            level: window.selectedLevel || 'standard'
          });
          await gameWorld.initialize();
          
          // Create player with existing components
          const player = new Player(gameWorld, window.inputManager, uiManager);
          
          // Create enemy manager
          const enemyManager = new EnemyManager(gameWorld, player);
          
          // Create weapon system
          const weaponSystem = new WeaponSystem(gameWorld, player, window.assetManager);
          
          // Create game application
          app = new Application({
            container: document.getElementById('arena-shooter-container'),
            gameWorld,
            player,
            enemyManager,
            weaponSystem,
            inputManager: window.inputManager,
            uiManager,
            assetManager: window.assetManager
          });
          
          // Store app reference globally
          window.currentApp = app;
          
          // Setup game over handler
          uiManager.on('gameOver', (score) => {
            document.getElementById('final-score').textContent = `Score: ${score}`;
            gameOverScreen.classList.remove('hidden');
            if (app) app.stop();
          });
          
          // Hide loading screen and show start screen for immediate action
          loadingScreen.style.display = 'none';
          
          // Start the game immediately
          // We don't need to wait for UI event since player already clicked 'START' on level select
          setTimeout(() => {
            // Start game loop
            app.start();
            
            // Request pointer lock
            setTimeout(() => {
              window.inputManager.requestPointerLock();
            }, 500); // Longer delay for better stability
          });
        } catch (error) {
          console.error('Error starting game:', error);
          throw error; // Rethrow to outer catch block
        }
      })();
      
      // Handle window close/navigation
      window.addEventListener('beforeunload', () => {
        if (app) app.dispose();
        if (window.assetManager) window.assetManager.dispose();
      });
      
      // Handle arena-shooter:dispose event (when leaving the page via Turbolinks)
      window.addEventListener('arena-shooter:dispose', () => {
        console.log('Disposing game resources');
        if (app) app.dispose();
        if (window.assetManager) window.assetManager.dispose();
      });
      
    } catch (error) {
      console.error('Fatal error starting game level:', error);
      
      // Display error message
      loadingBar.style.width = '100%';
      loadingBar.style.backgroundColor = '#ff3333';
      
      const loadingText = document.querySelector('#loading-screen h2');
      if (loadingText) {
        loadingText.textContent = 'Error Loading Game Level';
      }
      
      // Add retry button that goes back to level selection
      const retryButton = document.createElement('button');
      retryButton.textContent = 'Try Another Level';
      retryButton.style.marginTop = '20px';
      retryButton.style.padding = '10px 20px';
      retryButton.style.backgroundColor = '#ffcc00';
      retryButton.style.color = 'black';
      retryButton.style.border = 'none';
      retryButton.style.borderRadius = '4px';
      retryButton.style.cursor = 'pointer';
      
      retryButton.addEventListener('click', () => {
        // Hide loading screen
        loadingScreen.style.display = 'none';
        
        // Show level selection again
        window.showLevelSelect();
      });
      
      // Clear any existing buttons
      const existingButtons = loadingScreen.querySelectorAll('button');
      existingButtons.forEach(button => button.remove());
      
      // Add retry button
      loadingScreen.appendChild(retryButton);
    }
  }
  
  // Create ESC menu with additional buttons
  function createEscMenu() {
    // Create the menu container
    const escMenuContainer = document.createElement('div');
    escMenuContainer.id = 'esc-menu';
    escMenuContainer.style.position = 'fixed';
    escMenuContainer.style.top = '0';
    escMenuContainer.style.left = '0';
    escMenuContainer.style.width = '100%';
    escMenuContainer.style.height = '100%';
    escMenuContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    escMenuContainer.style.display = 'none';
    escMenuContainer.style.flexDirection = 'column';
    escMenuContainer.style.alignItems = 'center';
    escMenuContainer.style.justifyContent = 'center';
    escMenuContainer.style.zIndex = '1000';
    
    // Create menu title
    const menuTitle = document.createElement('h2');
    menuTitle.textContent = 'GAME PAUSED';
    menuTitle.style.color = 'white';
    menuTitle.style.fontSize = '36px';
    menuTitle.style.marginBottom = '30px';
    menuTitle.style.fontFamily = 'monospace';
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.gap = '15px';
    buttonsContainer.style.minWidth = '250px';
    
    // Create resume button
    const resumeButton = createMenuButton('RESUME', () => {
      console.log('Resume button clicked');
      
      // Hide menu first
      escMenuContainer.style.display = 'none';
      
      // Set game to running state and restart animation loop
      if (window.currentApp) {
        window.currentApp.isRunning = true;
        console.log('Game set to running state');
        // Restart the animation loop since it stops when isRunning is false
        requestAnimationFrame(window.currentApp.animate);
      }
      
      // Request pointer lock using the inputManager's method which has retry logic
      if (window.inputManager && window.inputManager.requestPointerLock) {
        console.log('Requesting pointer lock from resume button');
        window.inputManager.requestPointerLock();
      }
    });
    
    // Create restart button
    const restartButton = createMenuButton('RESTART', () => {
      console.log('Restart button clicked');
      
      // Hide menu first
      escMenuContainer.style.display = 'none';
      
      // Store current level before cleanup
      const currentLevel = window.selectedLevel || 'standard';
      
      // Set level transition flag to prevent unwanted ESC menus
      window.inLevelTransition = true;
      
      // Dispose current app
      if (window.currentApp) {
        console.log('Disposing current app for restart');
        window.currentApp.dispose();
        window.currentApp = null;
      }
      
      // Ensure pointer lock is removed completely
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock();
          console.log('Cleared pointer lock for restart');
        } catch (e) {
          console.warn('Failed to clear pointer lock for restart:', e);
        }
      }
      
      // Re-initialize the input manager to ensure fresh state for the restart
      // This addresses the issue with movement not working after level change
      if (window.inputManager) {
        window.inputManager.dispose();
        window.inputManager = new InputManager();
        console.log('Input manager re-initialized for restart');
      }
      
      // Longer delay to ensure proper cleanup
      setTimeout(() => {
        window.selectedLevel = currentLevel;
        console.log('Starting selected level after restart');
        startSelectedLevel();
      }, 300);
    });
    
    // Create level select button
    const levelSelectButton = createMenuButton('LEVEL SELECT', () => {
      console.log('Level select button clicked');
      
      // Hide menu first
      escMenuContainer.style.display = 'none';
      
      // Set level transition flag to prevent unwanted ESC menus
      window.inLevelTransition = true;
      
      // Dispose current app
      if (window.currentApp) {
        console.log('Disposing current app for level select');
        window.currentApp.dispose();
        window.currentApp = null;
      }
      
      // Ensure pointer lock is removed completely
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock();
          console.log('Cleared pointer lock for level select');
        } catch (e) {
          console.warn('Failed to clear pointer lock for level select:', e);
        }
      }
      
      // Re-initialize the input manager to ensure fresh state for level selection
      // This addresses the issue with movement not working after level change
      if (window.inputManager) {
        window.inputManager.dispose();
        window.inputManager = new InputManager();
        console.log('Input manager re-initialized for level selection');
      }
      
      // Longer delay to ensure proper cleanup
      setTimeout(() => {
        console.log('Showing level select after delay');
        window.showLevelSelect();
        
        // Reset transition flag after level select is shown
        setTimeout(() => {
          window.inLevelTransition = false;
        }, 500);
      }, 300);
    });
    
    // Create quit button
    const quitButton = createMenuButton('QUIT GAME', () => {
      console.log('Quit button clicked');
      
      // Hide menu first
      escMenuContainer.style.display = 'none';
      
      // Set level transition flag to prevent unwanted ESC menus
      window.inLevelTransition = true;
      
      // Dispose current app
      if (window.currentApp) {
        console.log('Disposing current app for quit');
        window.currentApp.dispose();
        window.currentApp = null;
      }
      
      // Ensure pointer lock is removed completely
      if (document.pointerLockElement) {
        try {
          document.exitPointerLock();
          console.log('Cleared pointer lock for quit');
        } catch (e) {
          console.warn('Failed to clear pointer lock for quit:', e);
        }
      }
      
      // Re-initialize the input manager to ensure fresh state
      // This addresses the issue with movement not working after game transitions
      if (window.inputManager) {
        window.inputManager.dispose();
        window.inputManager = new InputManager();
        console.log('Input manager re-initialized for returning to main menu');
      }
      
      // Go back to the start screen
      const startScreen = document.getElementById('start-screen');
      if (startScreen) {
        startScreen.style.display = 'flex';
        console.log('Start screen displayed');
      }
      
      // Reset transition flag after returning to start screen
      setTimeout(() => {
        window.inLevelTransition = false;
      }, 500);
    });
    
    // Helper function to create menu buttons
    function createMenuButton(text, onClick) {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.padding = '15px 20px';
      button.style.backgroundColor = 'rgba(40, 44, 52, 0.9)';
      button.style.color = 'white';
      button.style.border = '2px solid #666';
      button.style.borderRadius = '5px';
      button.style.fontSize = '18px';
      button.style.fontFamily = 'monospace';
      button.style.cursor = 'pointer';
      button.style.transition = 'all 0.2s ease';
      button.style.width = '100%';
      button.style.textAlign = 'center';
      
      button.addEventListener('mouseover', () => {
        button.style.backgroundColor = 'rgba(65, 105, 225, 0.8)';
        button.style.borderColor = '#99ccff';
        button.style.transform = 'scale(1.05)';
      });
      
      button.addEventListener('mouseout', () => {
        button.style.backgroundColor = 'rgba(40, 44, 52, 0.9)';
        button.style.borderColor = '#666';
        button.style.transform = 'scale(1)';
      });
      
      button.addEventListener('click', onClick);
      
      return button;
    }
    
    // Add everything to the menu
    buttonsContainer.appendChild(resumeButton);
    buttonsContainer.appendChild(restartButton);
    buttonsContainer.appendChild(levelSelectButton);
    buttonsContainer.appendChild(quitButton);
    
    escMenuContainer.appendChild(menuTitle);
    escMenuContainer.appendChild(buttonsContainer);
    
    document.body.appendChild(escMenuContainer);
    
    // Create a custom event handler for ESC key with debouncing
    let escKeyLastPressed = 0;
    const escKeyHandler = (event) => {
      if (event.code === 'Escape') {
        // Prevent default and stop propagation to avoid conflicts
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Skip ESC handling if we're in level transition
        if (window.inLevelTransition === true) {
          console.log('ESC pressed during level transition - ignoring');
          return;
        }
        
        // Debounce to prevent multiple triggers
        const now = Date.now();
        if (now - escKeyLastPressed < 500) {
          console.log('ESC pressed too quickly - debouncing');
          return; // Ignore if pressed too quickly
        }
        escKeyLastPressed = now;
        
        // Check if menu is visible
        const isMenuVisible = escMenuContainer.style.display === 'flex';
        
        // Check loading screen - don't toggle menu if loading
        const isLoading = document.getElementById('loading-screen').style.display === 'flex';
        if (isLoading) {
          console.log('ESC pressed during loading - ignoring');
          return;
        }
        
        // Check if level select is visible
        const isLevelSelectVisible = document.getElementById('level-select-modal').style.display === 'flex';
        if (isLevelSelectVisible) {
          console.log('ESC pressed during level select - ignoring');
          return;
        }
        
        if (window.currentApp && window.currentApp.isRunning && !isMenuVisible) {
          // If game is running and menu is not visible, show menu
          console.log('ESC pressed: Showing menu (isRunning=true, menuVisible=false)');
          escMenuContainer.style.display = 'flex';
          window.currentApp.isRunning = false;
          console.log('Game paused, isRunning set to false');
          
          // Ensure pointer is released when showing menu
          if (document.pointerLockElement) {
            try {
              document.exitPointerLock();
            } catch (e) {
              console.warn('Error exiting pointer lock on ESC menu show:', e);
            }
          }
        } else if (isMenuVisible) {
          // If menu is visible, resume the game
          console.log('ESC pressed: Hiding menu and resuming game');
          escMenuContainer.style.display = 'none';
          
          // Set game to running state and restart animation loop
          if (window.currentApp) {
            window.currentApp.isRunning = true;
            // Restart the animation loop since it stops when isRunning is false
            requestAnimationFrame(window.currentApp.animate);
          }
          
          // Request pointer lock using the inputManager's method which has retry logic
          if (window.inputManager && window.inputManager.requestPointerLock) {
            console.log('Requesting pointer lock from ESC key');
            window.inputManager.requestPointerLock();
          }
        }
      }
    };
    
    // Remove any existing ESC handlers before adding ours
    document.removeEventListener('keydown', escKeyHandler);
    // Add our handler
    document.addEventListener('keydown', escKeyHandler);
    
    return escMenuContainer;
  }
  
  // Create level selection UI
  createLevelSelectUI();
  
  // Create ESC menu
  createEscMenu();
  
  // Start the game
  startGame();
});