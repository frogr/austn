import { State } from '../StateMachine.js';

/**
 * Loading state for asset loading and initialization
 */
export class LoadingState extends State {
  constructor() {
    super('loading');
  }
  
  onEnter(stateMachine, prevState, params = {}) {
    const { engine, assetManifest, onComplete } = params;
    
    // Store references
    this.engine = engine;
    this.assetManager = engine.assetManager;
    this.onLoadingComplete = onComplete;
    
    // Create or get UI elements
    this.progressBar = document.getElementById('loading-progress') || this.createProgressBar();
    this.progressText = document.getElementById('loading-text') || this.createProgressText();
    
    // Show loading UI
    this.showLoadingUI();
    
    // Start loading assets
    this.startLoading(assetManifest);
  }
  
  onExit(stateMachine, nextState) {
    // Hide loading UI
    this.hideLoadingUI();
  }
  
  update(stateMachine, deltaTime) {
    // No update needed, loading is async
  }
  
  /**
   * Create a progress bar element
   * @returns {HTMLElement} - Created progress bar
   */
  createProgressBar() {
    const container = document.createElement('div');
    container.id = 'loading-container';
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.width = '50%';
    container.style.textAlign = 'center';
    container.style.zIndex = '1000';
    
    const title = document.createElement('h2');
    title.textContent = 'Loading Game...';
    title.style.color = 'white';
    title.style.marginBottom = '20px';
    container.appendChild(title);
    
    const progress = document.createElement('div');
    progress.id = 'loading-progress';
    progress.style.width = '100%';
    progress.style.height = '20px';
    progress.style.backgroundColor = '#333333';
    progress.style.borderRadius = '5px';
    progress.style.overflow = 'hidden';
    container.appendChild(progress);
    
    const bar = document.createElement('div');
    bar.style.width = '0%';
    bar.style.height = '100%';
    bar.style.backgroundColor = '#00aaff';
    bar.style.transition = 'width 0.2s ease-in-out';
    progress.appendChild(bar);
    
    const text = document.createElement('div');
    text.id = 'loading-text';
    text.textContent = 'Preparing...';
    text.style.color = 'white';
    text.style.marginTop = '10px';
    container.appendChild(text);
    
    document.body.appendChild(container);
    
    return progress;
  }
  
  /**
   * Create a progress text element
   * @returns {HTMLElement} - Created progress text
   */
  createProgressText() {
    return document.getElementById('loading-text');
  }
  
  /**
   * Show loading UI
   */
  showLoadingUI() {
    const container = document.getElementById('loading-container');
    if (container) {
      container.style.display = 'block';
    }
  }
  
  /**
   * Hide loading UI
   */
  hideLoadingUI() {
    const container = document.getElementById('loading-container');
    if (container) {
      container.style.display = 'none';
    }
  }
  
  /**
   * Start loading assets
   * @param {Object} manifest - Asset manifest
   */
  startLoading(manifest) {
    // Register event handlers
    this.assetManager.on('loadProgress', (data) => {
      this.updateProgress(data);
    });
    
    this.assetManager.on('loadComplete', (data) => {
      this.handleLoadingComplete(data);
    });
    
    // Start loading assets
    this.assetManager.loadAssets(manifest);
  }
  
  /**
   * Update progress UI
   * @param {Object} data - Progress data
   */
  updateProgress(data) {
    const percent = Math.floor(data.progress * 100);
    
    // Update progress bar
    if (this.progressBar) {
      const bar = this.progressBar.querySelector('div');
      if (bar) {
        bar.style.width = `${percent}%`;
      }
    }
    
    // Update text
    if (this.progressText) {
      this.progressText.textContent = `Loading assets: ${data.loaded}/${data.total} (${percent}%)`;
    }
  }
  
  /**
   * Handle completion of asset loading
   * @param {Object} data - Completion data
   */
  handleLoadingComplete(data) {
    // Check for errors
    if (data.errors.length > 0) {
      console.warn(`Loading completed with ${data.errors.length} errors`);
      
      // Display error count
      if (this.progressText) {
        this.progressText.textContent = `Loading completed with ${data.errors.length} errors.`;
      }
      
      // Log errors
      for (const error of data.errors) {
        console.error(`Failed to load asset: ${error.id}`, error.error);
      }
    }
    
    // Delay transition to give a moment to see 100%
    setTimeout(() => {
      // Call completion callback if provided
      if (typeof this.onLoadingComplete === 'function') {
        this.onLoadingComplete();
      }
    }, 500);
  }
}