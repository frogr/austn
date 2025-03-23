import { State } from '../StateMachine.js';

/**
 * Menu state for main menu, options, etc.
 */
export class MenuState extends State {
  constructor() {
    super('menu');
  }
  
  onEnter(stateMachine, prevState, params = {}) {
    const { engine, menuType = 'main' } = params;
    
    // Store references
    this.engine = engine;
    this.menuType = menuType;
    this.stateMachine = stateMachine;
    
    // Pause game engine if running
    this.engine.pause();
    
    // Show the appropriate menu
    this.showMenu(menuType);
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  onExit(stateMachine, nextState) {
    // Hide menu
    this.hideMenu();
    
    // Remove event listeners
    this.removeEventListeners();
  }
  
  update(stateMachine, deltaTime) {
    // Menu background effects could be updated here
  }
  
  /**
   * Show the specified menu
   * @param {string} menuType - Type of menu to show
   */
  showMenu(menuType) {
    // Get or create menu element
    let menuElement = document.getElementById(`menu-${menuType}`);
    
    if (!menuElement) {
      menuElement = this.createMenu(menuType);
    }
    
    // Show menu
    menuElement.style.display = 'flex';
  }
  
  /**
   * Hide the current menu
   */
  hideMenu() {
    const menuElement = document.getElementById(`menu-${this.menuType}`);
    
    if (menuElement) {
      menuElement.style.display = 'none';
    }
  }
  
  /**
   * Create a menu UI
   * @param {string} menuType - Type of menu to create
   * @returns {HTMLElement} - Created menu element
   */
  createMenu(menuType) {
    // Create container
    const container = document.createElement('div');
    container.id = `menu-${menuType}`;
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    container.style.zIndex = '100';
    
    // Create menu content based on type
    switch (menuType) {
      case 'main':
        this.createMainMenu(container);
        break;
      case 'pause':
        this.createPauseMenu(container);
        break;
      case 'options':
        this.createOptionsMenu(container);
        break;
      case 'levelSelect':
        this.createLevelSelectMenu(container);
        break;
      case 'gameOver':
        this.createGameOverMenu(container);
        break;
      default:
        this.createMainMenu(container);
    }
    
    // Add to document
    document.body.appendChild(container);
    
    return container;
  }
  
  /**
   * Create a button element
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   * @returns {HTMLElement} - Created button
   */
  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'menu-button';
    button.style.padding = '12px 24px';
    button.style.margin = '10px';
    button.style.fontSize = '18px';
    button.style.background = 'linear-gradient(to bottom, #4e73df, #224abe)';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.2s ease';
    
    // Hover effect
    button.addEventListener('mouseover', () => {
      button.style.background = 'linear-gradient(to bottom, #3a5ccc, #1a3ba0)';
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.background = 'linear-gradient(to bottom, #4e73df, #224abe)';
      button.style.transform = 'translateY(0)';
    });
    
    // Click handler
    button.addEventListener('click', onClick);
    
    return button;
  }
  
  /**
   * Create main menu content
   * @param {HTMLElement} container - Container element
   */
  createMainMenu(container) {
    // Title
    const title = document.createElement('h1');
    title.textContent = 'ARENA SHOOTER';
    title.style.color = 'white';
    title.style.fontSize = '48px';
    title.style.marginBottom = '40px';
    title.style.textShadow = '0 0 10px rgba(0, 170, 255, 0.8)';
    container.appendChild(title);
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.alignItems = 'center';
    container.appendChild(buttonsContainer);
    
    // Start button - go directly to playing state instead of level select
    const startButton = this.createButton('PLAY GAME', () => {
      this.stateMachine.transitionTo('playing', {
        engine: this.engine,
        levelId: 'arena'
      });
    });
    buttonsContainer.appendChild(startButton);
    
    // Options button
    const optionsButton = this.createButton('OPTIONS', () => {
      this.stateMachine.transitionTo('menu', { menuType: 'options' });
    });
    buttonsContainer.appendChild(optionsButton);
    
    // Credits button
    const creditsButton = this.createButton('CREDITS', () => {
      // Show credits overlay
      alert('Arena Shooter\nDeveloped with ECS Architecture\nBy Claude');
    });
    buttonsContainer.appendChild(creditsButton);
  }
  
  /**
   * Create pause menu content
   * @param {HTMLElement} container - Container element
   */
  createPauseMenu(container) {
    // Title
    const title = document.createElement('h1');
    title.textContent = 'GAME PAUSED';
    title.style.color = 'white';
    title.style.fontSize = '36px';
    title.style.marginBottom = '30px';
    container.appendChild(title);
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.alignItems = 'center';
    container.appendChild(buttonsContainer);
    
    // Resume button
    const resumeButton = this.createButton('RESUME', () => {
      this.stateMachine.transitionTo('playing');
    });
    buttonsContainer.appendChild(resumeButton);
    
    // Options button
    const optionsButton = this.createButton('OPTIONS', () => {
      this.stateMachine.transitionTo('menu', { menuType: 'options' });
    });
    buttonsContainer.appendChild(optionsButton);
    
    // Quit button
    const quitButton = this.createButton('QUIT TO MENU', () => {
      this.stateMachine.transitionTo('menu', { menuType: 'main' });
    });
    buttonsContainer.appendChild(quitButton);
  }
  
  /**
   * Create options menu content
   * @param {HTMLElement} container - Container element
   */
  createOptionsMenu(container) {
    // Title
    const title = document.createElement('h1');
    title.textContent = 'OPTIONS';
    title.style.color = 'white';
    title.style.fontSize = '36px';
    title.style.marginBottom = '30px';
    container.appendChild(title);
    
    // Options container
    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.alignItems = 'flex-start';
    optionsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    optionsContainer.style.padding = '20px';
    optionsContainer.style.borderRadius = '8px';
    optionsContainer.style.marginBottom = '20px';
    container.appendChild(optionsContainer);
    
    // Mouse sensitivity
    const sensitivityContainer = document.createElement('div');
    sensitivityContainer.style.display = 'flex';
    sensitivityContainer.style.alignItems = 'center';
    sensitivityContainer.style.marginBottom = '15px';
    sensitivityContainer.style.width = '100%';
    optionsContainer.appendChild(sensitivityContainer);
    
    const sensitivityLabel = document.createElement('label');
    sensitivityLabel.textContent = 'Mouse Sensitivity:';
    sensitivityLabel.style.color = 'white';
    sensitivityLabel.style.marginRight = '10px';
    sensitivityLabel.style.width = '150px';
    sensitivityContainer.appendChild(sensitivityLabel);
    
    const sensitivitySlider = document.createElement('input');
    sensitivitySlider.type = 'range';
    sensitivitySlider.min = '1';
    sensitivitySlider.max = '10';
    sensitivitySlider.value = '5';
    sensitivitySlider.style.flex = '1';
    sensitivityContainer.appendChild(sensitivitySlider);
    
    // Volume
    const volumeContainer = document.createElement('div');
    volumeContainer.style.display = 'flex';
    volumeContainer.style.alignItems = 'center';
    volumeContainer.style.marginBottom = '15px';
    volumeContainer.style.width = '100%';
    optionsContainer.appendChild(volumeContainer);
    
    const volumeLabel = document.createElement('label');
    volumeLabel.textContent = 'Sound Volume:';
    volumeLabel.style.color = 'white';
    volumeLabel.style.marginRight = '10px';
    volumeLabel.style.width = '150px';
    volumeContainer.appendChild(volumeLabel);
    
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = '80';
    volumeSlider.style.flex = '1';
    volumeContainer.appendChild(volumeSlider);
    
    // Graphics quality
    const qualityContainer = document.createElement('div');
    qualityContainer.style.display = 'flex';
    qualityContainer.style.alignItems = 'center';
    qualityContainer.style.marginBottom = '15px';
    qualityContainer.style.width = '100%';
    optionsContainer.appendChild(qualityContainer);
    
    const qualityLabel = document.createElement('label');
    qualityLabel.textContent = 'Graphics Quality:';
    qualityLabel.style.color = 'white';
    qualityLabel.style.marginRight = '10px';
    qualityLabel.style.width = '150px';
    qualityContainer.appendChild(qualityLabel);
    
    const qualitySelect = document.createElement('select');
    qualitySelect.style.flex = '1';
    qualitySelect.style.padding = '5px';
    qualitySelect.style.backgroundColor = '#333';
    qualitySelect.style.color = 'white';
    qualitySelect.style.border = '1px solid #555';
    qualityContainer.appendChild(qualitySelect);
    
    const qualities = ['Low', 'Medium', 'High', 'Ultra'];
    qualities.forEach(quality => {
      const option = document.createElement('option');
      option.value = quality.toLowerCase();
      option.textContent = quality;
      if (quality === 'Medium') option.selected = true;
      qualitySelect.appendChild(option);
    });
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'center';
    buttonsContainer.style.width = '100%';
    container.appendChild(buttonsContainer);
    
    // Apply button
    const applyButton = this.createButton('APPLY', () => {
      // Apply settings
      // In a real game, would save these settings
      
      // Return to previous menu
      const prevMenu = this.menuType === 'pause' ? 'pause' : 'main';
      this.stateMachine.transitionTo('menu', { menuType: prevMenu });
    });
    buttonsContainer.appendChild(applyButton);
    
    // Back button
    const backButton = this.createButton('BACK', () => {
      // Return to previous menu without applying
      const prevMenu = this.menuType === 'pause' ? 'pause' : 'main';
      this.stateMachine.transitionTo('menu', { menuType: prevMenu });
    });
    buttonsContainer.appendChild(backButton);
  }
  
  /**
   * Create level select menu content
   * @param {HTMLElement} container - Container element
   */
  createLevelSelectMenu(container) {
    // Title
    const title = document.createElement('h1');
    title.textContent = 'SELECT LEVEL';
    title.style.color = 'white';
    title.style.fontSize = '36px';
    title.style.marginBottom = '30px';
    container.appendChild(title);
    
    // Levels container
    const levelsContainer = document.createElement('div');
    levelsContainer.style.display = 'flex';
    levelsContainer.style.flexWrap = 'wrap';
    levelsContainer.style.justifyContent = 'center';
    levelsContainer.style.maxWidth = '800px';
    levelsContainer.style.marginBottom = '30px';
    container.appendChild(levelsContainer);
    
    // Level data
    const levels = [
      { id: 'arena', name: 'Arena', description: 'Standard battle arena' },
      { id: 'narrow', name: 'Narrow Paths', description: 'Tight corridors and choke points' },
      { id: 'open', name: 'Open Field', description: 'Wide open spaces' },
      { id: 'multi', name: 'Multi-Level', description: 'Multiple height levels' }
    ];
    
    // Create level cards
    levels.forEach(level => {
      const card = document.createElement('div');
      card.className = 'level-card';
      card.style.width = '200px';
      card.style.height = '150px';
      card.style.margin = '10px';
      card.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      card.style.border = '2px solid #333';
      card.style.borderRadius = '8px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'center';
      card.style.cursor = 'pointer';
      card.style.transition = 'all 0.2s ease';
      
      // Add hover effect
      card.addEventListener('mouseover', () => {
        card.style.backgroundColor = 'rgba(30, 80, 150, 0.5)';
        card.style.borderColor = '#4e73df';
        card.style.transform = 'scale(1.05)';
      });
      
      card.addEventListener('mouseout', () => {
        card.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        card.style.borderColor = '#333';
        card.style.transform = 'scale(1)';
      });
      
      // Add click handler
      card.addEventListener('click', () => {
        this.stateMachine.transitionTo('playing', { levelId: level.id });
      });
      
      // Level name
      const name = document.createElement('h3');
      name.textContent = level.name;
      name.style.color = 'white';
      name.style.margin = '0 0 10px 0';
      card.appendChild(name);
      
      // Level description
      const desc = document.createElement('p');
      desc.textContent = level.description;
      desc.style.color = '#ccc';
      desc.style.margin = '0';
      desc.style.textAlign = 'center';
      desc.style.padding = '0 10px';
      desc.style.fontSize = '14px';
      card.appendChild(desc);
      
      levelsContainer.appendChild(card);
    });
    
    // Back button
    const backButton = this.createButton('BACK', () => {
      this.stateMachine.transitionTo('menu', { menuType: 'main' });
    });
    container.appendChild(backButton);
  }
  
  /**
   * Create game over menu content
   * @param {HTMLElement} container - Container element
   */
  createGameOverMenu(container) {
    // Title
    const title = document.createElement('h1');
    title.textContent = 'GAME OVER';
    title.style.color = 'red';
    title.style.fontSize = '48px';
    title.style.marginBottom = '20px';
    title.style.textShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
    container.appendChild(title);
    
    // Score display
    const scoreDisplay = document.createElement('h2');
    scoreDisplay.id = 'game-over-score';
    scoreDisplay.textContent = 'Score: 0';
    scoreDisplay.style.color = 'white';
    scoreDisplay.style.fontSize = '24px';
    scoreDisplay.style.marginBottom = '30px';
    container.appendChild(scoreDisplay);
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.alignItems = 'center';
    container.appendChild(buttonsContainer);
    
    // Retry button
    const retryButton = this.createButton('RETRY', () => {
      // Restart the current level
      this.stateMachine.transitionTo('playing');
    });
    buttonsContainer.appendChild(retryButton);
    
    // Level select button
    const levelButton = this.createButton('LEVEL SELECT', () => {
      this.stateMachine.transitionTo('levelSelect');
    });
    buttonsContainer.appendChild(levelButton);
    
    // Main menu button
    const menuButton = this.createButton('MAIN MENU', () => {
      this.stateMachine.transitionTo('menu', { menuType: 'main' });
    });
    buttonsContainer.appendChild(menuButton);
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // We already have state machine reference from onEnter
    
    // Check for existing UI elements in the DOM
    const startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.addEventListener('click', () => {
        // Use the stateMachine reference to transition to the playing state
        this.stateMachine.transitionTo('playing', { engine: this.engine });
      });
    }
    
    // Set up any global event listeners
    document.addEventListener('keydown', this.handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        // Handle escape key based on menu type
        if (this.menuType === 'pause') {
          this.stateMachine.transitionTo('playing');
        } else if (this.menuType === 'options') {
          const prevMenu = this.previousMenuType || 'main';
          this.stateMachine.transitionTo('menu', { menuType: prevMenu });
        }
      }
    });
  }
  
  /**
   * Remove event listeners
   */
  removeEventListeners() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}