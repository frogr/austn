import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

/**
 * Manages loading and caching of game assets
 */
export class AssetManager {
  constructor() {
    // Initialize loaders
    this.textureLoader = new THREE.TextureLoader();
    this.audioLoader = new THREE.AudioLoader();
    
    // Initialize GLTF loader with Draco compression support
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    
    this.fbxLoader = new FBXLoader();
    
    // Asset caches
    this.textures = new Map();
    this.models = new Map();
    this.sounds = new Map();
    this.materials = new Map();
    
    // Define the assets to load
    this.assetManifest = {
      textures: [
        { name: 'floor', url: '/assets/textures/floor.jpg' },
        { name: 'wall', url: '/assets/textures/wall.jpg' },
        { name: 'skybox', url: '/assets/textures/skybox.jpg' },
        { name: 'muzzleFlash', url: '/assets/textures/muzzleFlash.png' },
      ],
      models: [
        // We'll use placeholder models since we don't have actual assets
        // In a real game, you'd replace these with actual model paths
      ],
      sounds: [
        { name: 'gunshot', url: '/assets/sounds/gunshot.mp3' },
        { name: 'reload', url: '/assets/sounds/reload.mp3' },
        { name: 'hit', url: '/assets/sounds/hit.mp3' },
      ],
    };
  }
  
  /**
   * Load all assets defined in the asset manifest
   * @param {Function} progressCallback - Callback for loading progress
   * @returns {Promise} - Resolves when all assets are loaded
   */
  async loadAssets(progressCallback = null) {
    const totalAssets = this.getTotalAssetCount();
    let loadedAssets = 0;
    
    const updateProgress = () => {
      loadedAssets++;
      const progress = loadedAssets / totalAssets;
      if (progressCallback) {
        progressCallback(progress);
      }
    };
    
    // Load textures
    const texturePromises = (this.assetManifest.textures || []).map(texture => 
      this.loadTexture(texture.name, texture.url).then(updateProgress)
    );
    
    // Load models
    const modelPromises = (this.assetManifest.models || []).map(model => 
      this.loadModel(model.name, model.url, model.type || 'gltf').then(updateProgress)
    );
    
    // Load sounds
    const soundPromises = (this.assetManifest.sounds || []).map(sound => 
      this.loadSound(sound.name, sound.url).then(updateProgress)
    );
    
    // Wait for all assets to load
    await Promise.all([
      ...texturePromises,
      ...modelPromises,
      ...soundPromises
    ]);
    
    // Create commonly used materials
    this.createMaterials();
    
    return this;
  }
  
  /**
   * Get the total number of assets to load
   * @returns {number} - Total assets
   */
  getTotalAssetCount() {
    return (
      (this.assetManifest.textures?.length || 0) +
      (this.assetManifest.models?.length || 0) +
      (this.assetManifest.sounds?.length || 0)
    );
  }
  
  /**
   * Load a texture and cache it
   * @param {string} name - Asset name
   * @param {string} url - Asset URL
   * @returns {Promise} - Resolves with the texture
   */
  loadTexture(name, url) {
    return new Promise((resolve) => {
      try {
        this.textureLoader.load(
          url,
          texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            this.textures.set(name, texture);
            console.log(`Texture loaded: ${name}`);
            resolve(texture);
          },
          undefined,
          error => {
            console.warn(`Failed to load texture ${name} from ${url}: ${error.message}`);
            // Create a fallback texture
            const fallbackTexture = this.createFallbackTexture(name);
            this.textures.set(name, fallbackTexture);
            resolve(fallbackTexture);
          }
        );
      } catch (e) {
        console.warn(`Error setting up texture loader for ${name}: ${e.message}`);
        // Create a fallback texture
        const fallbackTexture = this.createFallbackTexture(name);
        this.textures.set(name, fallbackTexture);
        resolve(fallbackTexture);
      }
    });
  }
  
  /**
   * Create a fallback texture when loading fails
   * @param {string} name - Texture name
   * @returns {THREE.Texture} - A basic colored texture
   */
  createFallbackTexture(name) {
    // Create a small canvas texture with a color based on the name
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Choose color based on texture name
    let color;
    switch(name) {
      case 'floor':
        color = '#8B4513'; // Brown
        break;
      case 'wall':
        color = '#A9A9A9'; // Dark gray
        break;
      case 'skybox':
        color = '#87CEEB'; // Sky blue
        break;
      case 'muzzleFlash':
        color = '#FFFF00'; // Yellow
        break;
      default:
        // Generate a pseudo-random color based on the name
        const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        color = `hsl(${hash % 360}, 70%, 60%)`;
    }
    
    // Fill the canvas
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add a grid pattern for non-skybox textures
    if (name !== 'skybox') {
      context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      context.lineWidth = 2;
      
      // Draw grid
      const gridSize = 32;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
      
      // Add the name to the texture
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 15, 200, 30);
      context.font = '20px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(`Fallback: ${name}`, canvas.width / 2, canvas.height / 2 + 7);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
  }
  
  /**
   * Load a 3D model and cache it
   * @param {string} name - Asset name
   * @param {string} url - Asset URL
   * @param {string} type - Model type (gltf or fbx)
   * @returns {Promise} - Resolves with the model
   */
  loadModel(name, url, type = 'gltf') {
    return new Promise((resolve, reject) => {
      const loader = type === 'gltf' ? this.gltfLoader : this.fbxLoader;
      
      loader.load(
        url,
        model => {
          this.models.set(name, model);
          resolve(model);
        },
        undefined,
        error => reject(error)
      );
    });
  }
  
  /**
   * Load a sound file and cache it
   * @param {string} name - Asset name
   * @param {string} url - Asset URL
   * @returns {Promise} - Resolves with the audio buffer
   */
  loadSound(name, url) {
    return new Promise((resolve) => {
      try {
        this.audioLoader.load(
          url,
          buffer => {
            this.sounds.set(name, buffer);
            console.log(`Sound loaded: ${name}`);
            resolve(buffer);
          },
          undefined,
          error => {
            console.warn(`Failed to load sound ${name} from ${url}: ${error.message}`);
            // We'll resolve anyway to prevent the game from failing to start
            resolve(null);
          }
        );
      } catch (e) {
        console.warn(`Error setting up sound loader for ${name}: ${e.message}`);
        // Resolve anyway to prevent the game from failing to start
        resolve(null);
      }
    });
  }
  
  /**
   * Create a silent audio buffer as a fallback
   * @returns {AudioBuffer} - A silent audio buffer
   */
  createSilentAudioBuffer() {
    try {
      // Create a very short silent audio buffer (0.1s)
      const sampleRate = 44100;
      const length = sampleRate * 0.1; // 0.1 seconds
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const buffer = audioContext.createBuffer(1, length, sampleRate);
      
      // Fill with silence (zeros)
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = 0;
      }
      
      return buffer;
    } catch (e) {
      console.warn('Failed to create silent audio buffer:', e);
      return null;
    }
  }
  
  /**
   * Create common materials
   */
  createMaterials() {
    // Floor material
    if (this.textures.has('floor')) {
      const floorTexture = this.textures.get('floor');
      floorTexture.repeat.set(10, 10);
      
      const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.8,
        metalness: 0.2
      });
      
      this.materials.set('floor', floorMaterial);
    }
    
    // Wall material
    if (this.textures.has('wall')) {
      const wallTexture = this.textures.get('wall');
      wallTexture.repeat.set(3, 3);
      
      const wallMaterial = new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.7,
        metalness: 0.1
      });
      
      this.materials.set('wall', wallMaterial);
    }
    
    // Enemy material
    const enemyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      roughness: 0.5,
      metalness: 0.7
    });
    
    this.materials.set('enemy', enemyMaterial);
    
    // Weapon material
    const weaponMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.2,
      metalness: 0.9
    });
    
    this.materials.set('weapon', weaponMaterial);
  }
  
  /**
   * Get an asset by name
   * @param {string} type - Asset type (texture, model, sound, material)
   * @param {string} name - Asset name
   * @returns {Object} - The requested asset
   */
  getAsset(type, name) {
    switch (type) {
      case 'texture':
        return this.textures.get(name);
      case 'model':
        return this.models.get(name);
      case 'sound':
        return this.sounds.get(name);
      case 'material':
        return this.materials.get(name);
      default:
        console.warn(`Unknown asset type: ${type}`);
        return null;
    }
  }
  
  /**
   * Create a copy of a model for use in the game
   * @param {string} name - Model name
   * @returns {Object} - Clone of the model
   */
  createModelInstance(name) {
    if (!this.models.has(name)) {
      console.warn(`Model not found: ${name}`);
      return null;
    }
    
    const original = this.models.get(name);
    let clone;
    
    // Handle different model formats
    if (original.scene) {
      // GLTF models have a scene property
      clone = original.scene.clone();
    } else {
      // FBX models are directly the mesh
      clone = original.clone();
    }
    
    return clone;
  }
  
  /**
   * Dispose all resources when no longer needed
   */
  dispose() {
    // Dispose textures
    this.textures.forEach(texture => texture.dispose());
    this.textures.clear();
    
    // Dispose materials
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
    
    // Models and sounds are managed by the browser's garbage collector
    this.models.clear();
    this.sounds.clear();
    
    // Dispose of Draco loader
    this.dracoLoader.dispose();
  }
}