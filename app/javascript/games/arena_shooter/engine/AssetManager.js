import * as THREE from 'three';
import { EventEmitter } from '../ecs/core/EventEmitter.js';

/**
 * AssetManager handles loading, caching, and providing game assets
 */
export class AssetManager extends EventEmitter {
  constructor() {
    super();
    
    // Asset collections
    this.textures = new Map();
    this.models = new Map();
    this.materials = new Map();
    this.sounds = new Map();
    this.shaders = new Map();
    
    // Loaders
    this.textureLoader = new THREE.TextureLoader();
    this.objectLoader = new THREE.ObjectLoader();
    this.audioLoader = new THREE.AudioLoader();
    
    // Track loading progress
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.errors = [];
  }
  
  /**
   * Load a batch of assets
   * @param {Object} manifest - Asset manifest object
   * @returns {Promise<AssetManager>} - This asset manager
   */
  async loadAssets(manifest) {
    // Reset counters
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.errors = [];
    
    // Count total assets
    for (const category in manifest) {
      if (manifest[category] && Array.isArray(manifest[category])) {
        this.totalAssets += manifest[category].length;
      }
    }
    
    // Emit start event
    this.emit('loadStart', { total: this.totalAssets });
    
    // Load each asset type
    const promises = [];
    
    // Load textures
    if (manifest.textures) {
      for (const texture of manifest.textures) {
        promises.push(this.loadTexture(texture.id, texture.url, texture.options));
      }
    }
    
    // Load models
    if (manifest.models) {
      for (const model of manifest.models) {
        promises.push(this.loadModel(model.id, model.url, model.options));
      }
    }
    
    // Load materials
    if (manifest.materials) {
      for (const material of manifest.materials) {
        this.createMaterial(material.id, material.type, material.properties);
      }
    }
    
    // Load sounds
    if (manifest.sounds) {
      for (const sound of manifest.sounds) {
        promises.push(this.loadSound(sound.id, sound.url));
      }
    }
    
    // Wait for all assets to load
    await Promise.allSettled(promises);
    
    // Emit complete event
    this.emit('loadComplete', {
      total: this.totalAssets,
      loaded: this.loadedAssets,
      errors: this.errors
    });
    
    return this;
  }
  
  /**
   * Update loading progress
   * @param {string} assetId - Asset identifier
   * @param {boolean} success - Whether loading succeeded
   * @param {Error} error - Error if loading failed
   */
  updateProgress(assetId, success, error = null) {
    this.loadedAssets++;
    
    if (!success) {
      this.errors.push({ id: assetId, error });
    }
    
    const progress = this.loadedAssets / this.totalAssets;
    
    this.emit('loadProgress', {
      id: assetId,
      loaded: this.loadedAssets,
      total: this.totalAssets,
      progress,
      success
    });
  }
  
  /**
   * Load a texture
   * @param {string} id - Texture identifier
   * @param {string} url - Texture URL
   * @param {Object} options - Texture options
   * @returns {Promise<THREE.Texture>} - Loaded texture
   */
  async loadTexture(id, url, options = {}) {
    try {
      const texture = await new Promise((resolve, reject) => {
        this.textureLoader.load(
          url,
          (tex) => resolve(tex),
          undefined,
          (error) => reject(error)
        );
      });
      
      // Apply options
      if (options.repeat) {
        texture.repeat.set(options.repeat.x || 1, options.repeat.y || 1);
      }
      
      if (options.wrapS) {
        texture.wrapS = THREE[options.wrapS];
      }
      
      if (options.wrapT) {
        texture.wrapT = THREE[options.wrapT];
      }
      
      if (options.minFilter) {
        texture.minFilter = THREE[options.minFilter];
      }
      
      if (options.magFilter) {
        texture.magFilter = THREE[options.magFilter];
      }
      
      if (options.encoding) {
        texture.encoding = THREE[options.encoding];
      }
      
      // Store texture
      this.textures.set(id, texture);
      
      // Update progress
      this.updateProgress(id, true);
      
      return texture;
    } catch (error) {
      console.error(`Failed to load texture: ${id}`, error);
      
      // Create fallback texture
      const fallback = this.createFallbackTexture();
      this.textures.set(id, fallback);
      
      // Update progress with error
      this.updateProgress(id, false, error);
      
      return fallback;
    }
  }
  
  /**
   * Load a 3D model
   * @param {string} id - Model identifier
   * @param {string} url - Model URL
   * @param {Object} options - Model options
   * @returns {Promise<THREE.Object3D>} - Loaded model
   */
  async loadModel(id, url, options = {}) {
    try {
      const model = await new Promise((resolve, reject) => {
        this.objectLoader.load(
          url,
          (obj) => resolve(obj),
          undefined,
          (error) => reject(error)
        );
      });
      
      // Apply options
      if (options.scale) {
        model.scale.set(options.scale, options.scale, options.scale);
      }
      
      // Store model
      this.models.set(id, model);
      
      // Update progress
      this.updateProgress(id, true);
      
      return model;
    } catch (error) {
      console.error(`Failed to load model: ${id}`, error);
      
      // Create fallback model
      const fallback = this.createFallbackModel();
      this.models.set(id, fallback);
      
      // Update progress with error
      this.updateProgress(id, false, error);
      
      return fallback;
    }
  }
  
  /**
   * Load a sound
   * @param {string} id - Sound identifier
   * @param {string} url - Sound URL
   * @returns {Promise<AudioBuffer>} - Loaded sound
   */
  async loadSound(id, url) {
    try {
      const buffer = await new Promise((resolve, reject) => {
        this.audioLoader.load(
          url,
          (buf) => resolve(buf),
          undefined,
          (error) => reject(error)
        );
      });
      
      // Store sound
      this.sounds.set(id, buffer);
      
      // Update progress
      this.updateProgress(id, true);
      
      return buffer;
    } catch (error) {
      console.error(`Failed to load sound: ${id}`, error);
      
      // Update progress with error
      this.updateProgress(id, false, error);
      
      return null;
    }
  }
  
  /**
   * Create a material
   * @param {string} id - Material identifier
   * @param {string} type - Material type
   * @param {Object} properties - Material properties
   * @returns {THREE.Material} - Created material
   */
  createMaterial(id, type = 'MeshStandardMaterial', properties = {}) {
    // Replace texture names with actual textures
    const props = { ...properties };
    
    // Process texture properties
    const textureProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'];
    
    for (const prop of textureProps) {
      if (props[prop] && typeof props[prop] === 'string') {
        const textureId = props[prop];
        props[prop] = this.textures.get(textureId) || null;
      }
    }
    
    // Create material based on type
    let material;
    
    switch (type) {
      case 'MeshBasicMaterial':
        material = new THREE.MeshBasicMaterial(props);
        break;
      case 'MeshStandardMaterial':
        material = new THREE.MeshStandardMaterial(props);
        break;
      case 'MeshPhongMaterial':
        material = new THREE.MeshPhongMaterial(props);
        break;
      case 'MeshLambertMaterial':
        material = new THREE.MeshLambertMaterial(props);
        break;
      case 'ShaderMaterial':
        material = new THREE.ShaderMaterial(props);
        break;
      default:
        material = new THREE.MeshStandardMaterial(props);
    }
    
    // Store material
    this.materials.set(id, material);
    
    // Update progress
    this.updateProgress(id, true);
    
    return material;
  }
  
  /**
   * Create a fallback texture (checker pattern)
   * @returns {THREE.Texture} - Fallback texture
   */
  createFallbackTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    context.fillStyle = '#ff00ff'; // Magenta for error
    context.fillRect(0, 0, size, size);
    
    // Draw checker pattern
    context.fillStyle = '#000000';
    const tileSize = size / 8;
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 0) {
          context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
  
  /**
   * Create a fallback model (simple cube)
   * @returns {THREE.Object3D} - Fallback model
   */
  createFallbackModel() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff00ff, // Magenta for error
      wireframe: true
    });
    
    return new THREE.Mesh(geometry, material);
  }
  
  /**
   * Get an asset by type and ID
   * @param {string} type - Asset type ('texture', 'model', 'material', 'sound')
   * @param {string} id - Asset identifier
   * @returns {any} - The requested asset or null if not found
   */
  getAsset(type, id) {
    switch (type.toLowerCase()) {
      case 'texture':
        return this.textures.get(id) || null;
      case 'model':
        return this.models.get(id)?.clone() || null;
      case 'material':
        return this.materials.get(id) || null;
      case 'sound':
        return this.sounds.get(id) || null;
      case 'shader':
        return this.shaders.get(id) || null;
      default:
        console.warn(`Unknown asset type: ${type}`);
        return null;
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    // Dispose textures
    for (const texture of this.textures.values()) {
      texture.dispose();
    }
    
    // Dispose materials
    for (const material of this.materials.values()) {
      material.dispose();
    }
    
    // Clear collections
    this.textures.clear();
    this.models.clear();
    this.materials.clear();
    this.sounds.clear();
    this.shaders.clear();
    
    // Clear event listeners
    this.clear();
  }
}