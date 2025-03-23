import * as THREE from 'three';
import { System } from '../core/System.js';
import { TransformComponent } from '../components/TransformComponent.js';
import { MeshComponent } from '../components/MeshComponent.js';

/**
 * System that handles rendering
 */
export class RenderSystem extends System {
  constructor(renderer, camera) {
    super();
    this.requiredComponents = ['TransformComponent', 'MeshComponent'];
    this.renderer = renderer;
    this.camera = camera;
    this.frustum = new THREE.Frustum();
    this.projScreenMatrix = new THREE.Matrix4();
  }
  
  /**
   * Called when the system is registered with a world
   */
  onRegistered() {
    // Add camera to scene if not already there
    if (this.camera && !this.camera.parent) {
      this.world.scene.add(this.camera);
    }
    
    // Add ambient light if needed
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.world.scene.add(ambientLight);
  }
  
  /**
   * Process a single entity
   * @param {Entity} entity - The entity to process
   * @param {number} deltaTime - Time since last update
   */
  processEntity(entity, deltaTime) {
    const transform = entity.getComponent(TransformComponent);
    const mesh = entity.getComponent(MeshComponent);
    
    // Sync transform if needed
    if (mesh.mesh) {
      // Check if object3D position and mesh position are different
      if (!mesh.mesh.position.equals(new THREE.Vector3()) ||
          !mesh.mesh.quaternion.equals(new THREE.Quaternion()) ||
          !mesh.mesh.scale.equals(new THREE.Vector3(1, 1, 1))) {
        
        // We want mesh to inherit transforms from entity.object3D
        // Reset mesh's local transform
        mesh.mesh.position.set(0, 0, 0);
        mesh.mesh.quaternion.identity();
        mesh.mesh.scale.set(1, 1, 1);
      }
    }
  }
  
  /**
   * Update frustum for culling
   */
  updateFrustum() {
    this.projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }
  
  /**
   * Check if an object is visible in the camera frustum
   * @param {THREE.Object3D} object - The object to check
   * @returns {boolean} - Whether the object is visible
   */
  isVisible(object) {
    const boundingSphere = new THREE.Sphere();
    object.updateMatrixWorld();
    
    // Compute bounding sphere
    const geometry = object.geometry;
    if (geometry) {
      if (!geometry.boundingSphere) {
        geometry.computeBoundingSphere();
      }
      boundingSphere.copy(geometry.boundingSphere);
      boundingSphere.applyMatrix4(object.matrixWorld);
      return this.frustum.intersectsSphere(boundingSphere);
    }
    
    return true;
  }
  
  /**
   * Render the scene
   */
  render() {
    if (this.renderer && this.camera) {
      this.renderer.render(this.world.scene, this.camera);
    }
  }
  
  /**
   * Post update processing
   * @param {number} deltaTime - Time since last update
   */
  postUpdate(deltaTime) {
    // Update frustum for culling
    this.updateFrustum();
    
    // Render scene
    this.render();
  }
}