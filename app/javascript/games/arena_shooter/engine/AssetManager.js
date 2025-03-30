/**
 * Optimized Asset Manager for the Arena Shooter game
 * - Handles loading and caching of game assets (textures, sounds, models)
 * - Provides optimized loading with WebP support
 * - Implements aggressive caching of assets
 * - Handles progress tracking during loading
 */
class AssetManager {
  constructor() {
    this.textures = new Map();
    this.sounds = new Map();
    this.models = new Map();
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.onProgressCallbacks = [];
    this.supportsWebP = null; // Will be detected on initialization
    
    // Check WebP support at initialization
    this.detectWebPSupport();
  }
  
  /**
   * Detect WebP support in the current browser
   * @private
   */
  detectWebPSupport() {
    const webpTest = new Image();
    
    webpTest.onload = () => {
      this.supportsWebP = true;
    };
    
    webpTest.onerror = () => {
      this.supportsWebP = false;
    };
    
    // A simple 2x2 WebP image in base64
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }
  
  /**
   * Register a progress callback
   * @param {Function} callback - Function to call with progress updates (0-1)
   */
  onProgress(callback) {
    this.onProgressCallbacks.push(callback);
  }
  
  /**
   * Updates loading progress and notifies all registered callbacks
   * @private
   */
  updateProgress() {
    this.loadedAssets++;
    const progress = this.totalAssets > 0 ? this.loadedAssets / this.totalAssets : 0;
    
    this.onProgressCallbacks.forEach(callback => {
      callback(progress);
    });
  }
  
  /**
   * Get the best image format based on browser support
   * @param {string} originalPath - The original asset path
   * @returns {string} - Path with the best format extension
   * @private
   */
  getBestFormatPath(originalPath) {
    // If WebP is supported and the original isn't already a WebP, use WebP version
    if (this.supportsWebP === true && !originalPath.endsWith('.webp')) {
      // Replace common image extensions with .webp
      return originalPath.replace(/\.(jpg|jpeg|png)$/, '.webp');
    }
    
    // Otherwise use the original format
    return originalPath;
  }
  
  /**
   * Load a texture with optimized format selection and responsive loading
   * @param {string} key - The identifier for this texture
   * @param {string} path - The path to the texture asset
   * @param {Object} options - Texture options (filtering, etc.)
   * @returns {Promise<THREE.Texture>} - Promise that resolves with the loaded texture
   */
  loadTexture(key, path, options = {}) {
    // Track total assets for progress calculations
    this.totalAssets++;
    
    // Check if texture is already cached
    if (this.textures.has(key)) {
      this.updateProgress();
      return Promise.resolve(this.textures.get(key));
    }
    
    // Use the best format based on browser support
    const bestPath = this.getBestFormatPath(path);
    
    // Create a texture loader
    // Use dynamic import to avoid bundling THREE.js for clients that don't need it
    return import('three').then(THREE => {
      const loader = new THREE.TextureLoader();
      
      return new Promise((resolve, reject) => {
        loader.load(
          // URL
          bestPath,
          
          // onLoad callback
          (texture) => {
            // Apply texture options
            if (options.repeat) {
              texture.repeat.set(options.repeat[0], options.repeat[1]);
            }
            
            if (options.wrapS) {
              texture.wrapS = options.wrapS;
            }
            
            if (options.wrapT) {
              texture.wrapT = options.wrapT;
            }
            
            if (options.minFilter) {
              texture.minFilter = options.minFilter;
            }
            
            if (options.magFilter) {
              texture.magFilter = options.magFilter;
            }
            
            if (options.anisotropy) {
              texture.anisotropy = options.anisotropy;
            }
            
            // Cache the texture
            this.textures.set(key, texture);
            this.updateProgress();
            resolve(texture);
          },
          
          // onProgress callback
          undefined,
          
          // onError callback
          (err) => {
            console.error(`Failed to load texture: ${path}`, err);
            
            // Create a fallback texture
            const fallbackTexture = this.createFallbackTexture(THREE);
            this.textures.set(key, fallbackTexture);
            this.updateProgress();
            resolve(fallbackTexture);
          }
        );
      });
    });
  }
  
  /**
   * Creates a fallback texture when actual texture loading fails
   * @param {THREE} THREE - The Three.js library
   * @returns {THREE.Texture} - A fallback checkerboard texture
   * @private 
   */
  createFallbackTexture(THREE) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Draw a checkerboard pattern
    const tileSize = 16;
    for (let y = 0; y < canvas.height; y += tileSize) {
      for (let x = 0; x < canvas.width; x += tileSize) {
        ctx.fillStyle = (x + y) % (tileSize * 2) === 0 ? '#f00' : '#f99';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }
    
    // Add missing texture indicator
    ctx.fillStyle = '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MISSING', canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
  
  /**
   * Batch load multiple textures at once
   * @param {Object} textureManifest - Object mapping texture keys to paths
   * @param {Object} options - Default options for all textures
   * @returns {Promise<Map<string, THREE.Texture>>} - Promise that resolves when all textures are loaded
   */
  loadTextures(textureManifest, options = {}) {
    const promises = Object.entries(textureManifest).map(([key, path]) => {
      return this.loadTexture(key, path, options);
    });
    
    return Promise.all(promises).then(() => this.textures);
  }
  
  /**
   * Preloads the most essential game assets
   * @returns {Promise<void>} - Promise that resolves when essential assets are loaded
   */
  preloadEssentialAssets() {
    // Define essential textures needed at startup
    const essentialTextures = {
      'floor': '/assets/textures/floor.jpg',
      'wall': '/assets/textures/wall.jpg'
    };
    
    return this.loadTextures(essentialTextures);
  }
  
  /**
   * Load remaining non-essential assets
   * @returns {Promise<void>} - Promise that resolves when all assets are loaded
   */
  loadRemainingAssets() {
    // Define non-essential textures that can be loaded after game starts
    const remainingTextures = {
      'skybox': '/assets/textures/skybox.jpg',
      'muzzleFlash': '/assets/textures/muzzleFlash.png'
    };
    
    return this.loadTextures(remainingTextures);
  }
  
  /**
   * Get a loaded texture by key
   * @param {string} key - The texture identifier
   * @returns {THREE.Texture|null} - The texture or null if not found
   */
  getTexture(key) {
    return this.textures.get(key) || null;
  }
  
  /**
   * Clears all stored assets to free memory
   */
  clear() {
    // Dispose of all textures to free GPU memory
    this.textures.forEach(texture => {
      if (texture && typeof texture.dispose === 'function') {
        texture.dispose();
      }
    });
    
    this.textures.clear();
    this.sounds.clear();
    this.models.clear();
    this.loadedAssets = 0;
    this.totalAssets = 0;
  }
}

export default AssetManager;