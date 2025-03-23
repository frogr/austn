import * as THREE from 'three';
import { Component } from '../core/Component.js';

/**
 * Component for rendering a mesh
 */
export class MeshComponent extends Component {
  constructor(geometry, material) {
    super();
    this.geometry = geometry;
    this.material = material;
    this.mesh = null;
    this.castShadow = true;
    this.receiveShadow = true;
  }
  
  onAttach() {
    // Create mesh and add to entity
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = this.castShadow;
    this.mesh.receiveShadow = this.receiveShadow;
    
    this.entity.object3D.add(this.mesh);
  }
  
  onDetach() {
    // Clean up mesh
    if (this.mesh) {
      this.entity.object3D.remove(this.mesh);
      this.mesh.geometry.dispose();
      
      // Dispose material if it's not shared
      if (Array.isArray(this.mesh.material)) {
        this.mesh.material.forEach(material => material.dispose());
      } else if (this.mesh.material.dispose) {
        this.mesh.material.dispose();
      }
      
      this.mesh = null;
    }
  }
  
  /**
   * Set mesh visibility
   * @param {boolean} visible - Visibility state
   * @returns {MeshComponent} - Returns this for chaining
   */
  setVisible(visible) {
    if (this.mesh) {
      this.mesh.visible = visible;
    }
    return this;
  }
  
  /**
   * Set mesh material
   * @param {THREE.Material} material - The new material
   * @returns {MeshComponent} - Returns this for chaining
   */
  setMaterial(material) {
    if (this.mesh) {
      this.mesh.material = material;
    }
    this.material = material;
    return this;
  }
}