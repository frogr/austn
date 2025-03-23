import * as THREE from 'three';
import { 
  TransformComponent, 
  MeshComponent, 
  PhysicsComponent, 
  HealthComponent 
} from '../ecs/index.js';

/**
 * Factory class for creating game entities
 */
export class EntityFactory {
  constructor(world, assetManager) {
    this.world = world;
    this.assetManager = assetManager;
  }
  
  /**
   * Create a basic cube entity
   * @param {Object} params - Cube parameters
   * @returns {Entity} - Created entity
   */
  createCube(params = {}) {
    const {
      position = new THREE.Vector3(0, 0, 0),
      size = 1,
      color = 0xffffff,
      mass = 1,
      health = 100
    } = params;
    
    // Create entity
    const entity = this.world.createEntity();
    
    // Create geometry and material
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ color });
    
    // Add components
    entity.addComponent(new TransformComponent(position))
          .addComponent(new MeshComponent(geometry, material))
          .addComponent(new PhysicsComponent())
          .addComponent(new HealthComponent(health));
    
    // Configure physics
    const physics = entity.getComponent(PhysicsComponent);
    physics.mass = mass;
    physics.collisionShape = 'box';
    physics.collisionRadius = size / 2;
    
    return entity;
  }
  
  /**
   * Create a sphere entity
   * @param {Object} params - Sphere parameters
   * @returns {Entity} - Created entity
   */
  createSphere(params = {}) {
    const {
      position = new THREE.Vector3(0, 0, 0),
      radius = 0.5,
      segments = 16,
      color = 0xffffff,
      mass = 1,
      health = 100
    } = params;
    
    // Create entity
    const entity = this.world.createEntity();
    
    // Create geometry and material
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshStandardMaterial({ color });
    
    // Add components
    entity.addComponent(new TransformComponent(position))
          .addComponent(new MeshComponent(geometry, material))
          .addComponent(new PhysicsComponent())
          .addComponent(new HealthComponent(health));
    
    // Configure physics
    const physics = entity.getComponent(PhysicsComponent);
    physics.mass = mass;
    physics.collisionShape = 'sphere';
    physics.collisionRadius = radius;
    
    return entity;
  }
  
  /**
   * Create a plane entity
   * @param {Object} params - Plane parameters
   * @returns {Entity} - Created entity
   */
  createPlane(params = {}) {
    const {
      position = new THREE.Vector3(0, 0, 0),
      rotation = new THREE.Euler(-Math.PI / 2, 0, 0),
      width = 10,
      height = 10,
      color = 0xffffff,
      receiveShadow = true
    } = params;
    
    // Create entity
    const entity = this.world.createEntity();
    
    // Create geometry and material
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({ color });
    
    // Add components
    entity.addComponent(new TransformComponent(position, rotation))
          .addComponent(new MeshComponent(geometry, material))
          .addComponent(new PhysicsComponent());
    
    // Configure mesh
    const mesh = entity.getComponent(MeshComponent);
    mesh.receiveShadow = receiveShadow;
    
    // Configure physics
    const physics = entity.getComponent(PhysicsComponent);
    physics.isKinematic = true; // Static plane
    physics.collisionShape = 'box';
    physics.useGravity = false;
    
    return entity;
  }
  
  /**
   * Create a light entity
   * @param {Object} params - Light parameters
   * @returns {Entity} - Created entity
   */
  createLight(params = {}) {
    const {
      type = 'point',
      position = new THREE.Vector3(0, 5, 0),
      color = 0xffffff,
      intensity = 1,
      distance = 0,
      decay = 2,
      castShadow = true
    } = params;
    
    // Create entity
    const entity = this.world.createEntity();
    
    // Add transform component
    entity.addComponent(new TransformComponent(position));
    
    // Create light based on type
    let light;
    
    switch (type.toLowerCase()) {
      case 'point':
        light = new THREE.PointLight(color, intensity, distance, decay);
        break;
      case 'directional':
        light = new THREE.DirectionalLight(color, intensity);
        break;
      case 'spot':
        const { angle = Math.PI/3, penumbra = 0 } = params;
        light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
        break;
      case 'ambient':
        light = new THREE.AmbientLight(color, intensity);
        break;
      default:
        light = new THREE.PointLight(color, intensity, distance, decay);
    }
    
    // Configure shadow
    if (light.shadow && castShadow) {
      light.castShadow = true;
      
      // Configure shadow properties
      if (params.shadowMapSize) {
        light.shadow.mapSize.width = params.shadowMapSize;
        light.shadow.mapSize.height = params.shadowMapSize;
      }
      
      if (params.shadowRadius) {
        light.shadow.radius = params.shadowRadius;
      }
      
      // Set shadow camera properties
      if (light.shadow.camera) {
        const cam = light.shadow.camera;
        
        if (params.shadowCameraNear) cam.near = params.shadowCameraNear;
        if (params.shadowCameraFar) cam.far = params.shadowCameraFar;
        
        // For directional lights
        if (light instanceof THREE.DirectionalLight) {
          if (params.shadowCameraLeft) cam.left = params.shadowCameraLeft;
          if (params.shadowCameraRight) cam.right = params.shadowCameraRight;
          if (params.shadowCameraTop) cam.top = params.shadowCameraTop;
          if (params.shadowCameraBottom) cam.bottom = params.shadowCameraBottom;
        }
      }
    }
    
    // Add light to entity object3D
    entity.object3D.add(light);
    
    // Add a helper for debugging
    if (params.helper && light.shadow && light.shadow.camera) {
      const helper = new THREE.CameraHelper(light.shadow.camera);
      entity.object3D.add(helper);
      helper.visible = false; // Off by default
    }
    
    return entity;
  }
  
  /**
   * Create a camera entity
   * @param {Object} params - Camera parameters
   * @returns {Entity} - Created entity
   */
  createCamera(params = {}) {
    const {
      type = 'perspective',
      position = new THREE.Vector3(0, 5, 10),
      lookAt = new THREE.Vector3(0, 0, 0)
    } = params;
    
    // Create entity
    const entity = this.world.createEntity();
    
    // Add transform component
    const transform = new TransformComponent(position);
    entity.addComponent(transform);
    
    // Create camera based on type
    let camera;
    
    if (type.toLowerCase() === 'perspective') {
      const {
        fov = 75,
        aspect = window.innerWidth / window.innerHeight,
        near = 0.1,
        far = 1000
      } = params;
      
      camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    } else {
      const {
        left = -10,
        right = 10,
        top = 10,
        bottom = -10,
        near = 0.1,
        far = 1000
      } = params;
      
      camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    }
    
    // Point camera at target
    camera.lookAt(lookAt);
    
    // Add camera to entity object3D
    entity.object3D.add(camera);
    
    return entity;
  }
  
  /**
   * Create a skybox entity
   * @param {Object} params - Skybox parameters
   * @returns {Entity} - Created entity
   */
  createSkybox(params = {}) {
    const {
      texturePath = null,
      textureId = null,
      size = 1000
    } = params;
    
    // Create entity
    const entity = this.world.createEntity();
    
    // Add transform component
    entity.addComponent(new TransformComponent());
    
    // Get or load texture
    let texture = null;
    
    if (textureId) {
      texture = this.assetManager.getAsset('texture', textureId);
    } else if (texturePath) {
      // TODO: Load texture dynamically if needed
    }
    
    if (!texture) {
      console.warn('No valid texture for skybox');
      return entity;
    }
    
    // Create skybox geometry
    const geometry = new THREE.SphereGeometry(size, 64, 32);
    
    // Invert the geometry so that texture is visible from inside
    geometry.scale(-1, 1, 1);
    
    // Create material
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide
    });
    
    // Add mesh component
    entity.addComponent(new MeshComponent(geometry, material));
    
    return entity;
  }
  
  /**
   * Create a projectile entity
   * @param {Object} params - Projectile parameters
   * @returns {Entity} - Created entity
   */
  createProjectile(params = {}) {
    const {
      position = new THREE.Vector3(),
      direction = new THREE.Vector3(0, 0, -1),
      speed = 20,
      size = 0.1,
      color = 0x00ffff,
      damage = 10,
      lifetime = 2,
      team = 1,
      emissive = true,
      lightIntensity = 1,
      type = 'bullet',
      onImpact = null
    } = params;
    
    // Create entity
    const entity = this.world.createEntity();
    
    // Add tag based on type
    entity.addTag('projectile').addTag(type);
    
    // Create geometry based on type
    let geometry;
    
    if (type === 'rocket') {
      geometry = new THREE.CylinderGeometry(size * 0.2, size * 0.5, size * 3, 8);
      // Rotate to point forward (along Z axis)
      geometry.rotateX(Math.PI / 2);
    } else {
      geometry = new THREE.SphereGeometry(size, 8, 8);
      
      // For tracer rounds, make them longer
      if (params.tracer) {
        geometry.scale(1, 1, 4);
      }
    }
    
    // Create material
    const material = new THREE.MeshBasicMaterial({ 
      color,
      emissive: emissive ? color : null,
      emissiveIntensity: emissive ? 1.5 : 0,
      transparent: true,
      opacity: 0.8
    });
    
    // Add components
    entity.addComponent(new TransformComponent(position))
          .addComponent(new MeshComponent(geometry, material))
          .addComponent(new PhysicsComponent());
    
    // Configure physics
    const physics = entity.getComponent(PhysicsComponent);
    physics.velocity = direction.clone().normalize().multiplyScalar(speed);
    physics.collisionRadius = size;
    physics.collisionShape = 'sphere';
    physics.mass = 0.1;
    physics.useGravity = false;
    
    // Store additional properties on entity
    entity.damage = damage;
    entity.lifetime = lifetime;
    entity.team = team;
    entity.projectileType = type;
    entity.onImpact = onImpact;
    
    // For rockets, add splash damage properties
    if (type === 'rocket') {
      entity.splashDamage = params.splashDamage || damage;
      entity.splashRadius = params.splashRadius || 3;
      
      // Add a point light for rocket
      const light = new THREE.PointLight(0xff6600, lightIntensity, 5);
      entity.object3D.add(light);
    }
    
    return entity;
  }
}