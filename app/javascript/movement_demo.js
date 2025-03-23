import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("Movement Demo initializing");
  
  // DOM elements
  const container = document.getElementById('movement-demo-container');
  const startButton = document.getElementById('start-button');
  const startScreen = document.getElementById('start-screen');
  const crosshair = document.getElementById('crosshair');
  
  if (!container) {
    console.error("Container element not found!");
    return;
  }
  
  // Global variables (like the ThreeJS example)
  let camera, scene, renderer, controls;
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let prevTime = performance.now();
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  
  // Initialize the demo
  init();
  animate();
  
  function init() {
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1.7; // Eye height
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x88ccff);
    
    // Add fog for atmosphere
    scene.fog = new THREE.Fog(0x88ccff, 0, 750);
    
    // Create light
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);
    
    // Create ground
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000, 100, 100),
      new THREE.MeshBasicMaterial({ color: 0x88aa88, wireframe: false })
    );
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    
    // Add some objects to the scene
    const boxGeometry = new THREE.BoxGeometry(20, 20, 20);
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xcc8866 });
    
    // Create a grid of boxes
    for (let x = -5; x <= 5; x += 2) {
      for (let z = -5; z <= 5; z += 2) {
        if (Math.random() > 0.8) {
          const box = new THREE.Mesh(boxGeometry, boxMaterial);
          box.position.set(x * 20, 10, z * 20);
          scene.add(box);
        }
      }
    }
    
    // Setup controls
    controls = new PointerLockControls(camera, container);
    scene.add(controls.getObject());
    
    // Handle pointer lock events
    controls.addEventListener('lock', () => {
      startScreen.style.display = 'none';
      crosshair.style.display = 'block';
      console.log('Controls locked');
    });
    
    controls.addEventListener('unlock', () => {
      startScreen.style.display = 'flex';
      crosshair.style.display = 'none';
      console.log('Controls unlocked');
    });
    
    // Start button click handler
    startButton.addEventListener('click', () => {
      controls.lock();
    });
    
    // Setup key handlers
    const onKeyDown = function(event) {
      switch(event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight = true;
          break;
      }
      console.log(`Key down: ${event.code}, Forward: ${moveForward}`);
    };
    
    const onKeyUp = function(event) {
      switch(event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight = false;
          break;
      }
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: document.createElement('canvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    console.log("Movement demo initialized");
  }
  
  function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
      const time = performance.now();
      const delta = (time - prevTime) / 1000;
      
      // Apply friction to slow down
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      
      // Set movement direction
      direction.z = Number(moveForward) - Number(moveBackward);
      direction.x = Number(moveRight) - Number(moveLeft);
      
      // Normalize for consistent movement speed in all directions
      if (direction.length() > 0) {
        direction.normalize();
      }
      
      // Apply movement based on keys pressed
      if (moveForward || moveBackward) {
        velocity.z -= direction.z * 400.0 * delta;
      }
      
      if (moveLeft || moveRight) {
        velocity.x -= direction.x * 400.0 * delta;
      }
      
      // Apply movement through controls
      controls.moveRight(-velocity.x * delta);
      controls.moveForward(-velocity.z * delta);
      
      // Debug log
      if (Math.random() < 0.01) {
        console.log(`Position: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`);
        console.log(`Direction: ${direction.x.toFixed(2)}, ${direction.z.toFixed(2)}`);
        console.log(`Velocity: ${velocity.x.toFixed(2)}, ${velocity.z.toFixed(2)}`);
      }
      
      prevTime = time;
    }
    
    // Render the scene
    renderer.render(scene, camera);
  }
});