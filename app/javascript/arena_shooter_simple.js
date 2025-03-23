// Import the PointerLockControls
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Global variables (just like the example)
let camera, scene, renderer, controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Initialize everything
function init() {
  // Create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.y = 1.7;
  
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x88ccff);
  
  // Create ground plane
  const planeGeometry = new THREE.PlaneGeometry(2000, 2000);
  planeGeometry.rotateX(-Math.PI / 2);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x404040 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);
  
  // Create light
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);
  
  // Setup controls
  controls = new PointerLockControls(camera, document.getElementById('arena-shooter-container'));
  scene.add(controls.getObject());
  
  // Add event listeners for pointer lock
  const startButton = document.getElementById('start-button');
  if (startButton) {
    startButton.addEventListener('click', () => {
      controls.lock();
    });
  }
  
  // Handle lock/unlock events
  controls.addEventListener('lock', () => {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'none';
    console.log('Controls locked');
  });
  
  controls.addEventListener('unlock', () => {
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'flex';
    console.log('Controls unlocked');
  });
  
  // Setup key controls
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
    console.log(`Key up: ${event.code}`);
  };
  
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('arena-shooter-container').appendChild(renderer.domElement);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (controls.isLocked) {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    
    // Apply friction
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    
    // Set direction vector
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    
    // Normalize direction
    if (direction.length() > 0) {
      direction.normalize();
    }
    
    // Apply movement based on direction
    if (moveForward || moveBackward) {
      velocity.z -= direction.z * 400.0 * delta;
    }
    
    if (moveLeft || moveRight) {
      velocity.x -= direction.x * 400.0 * delta;
    }
    
    // Move using controls helper methods
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    
    prevTime = time;
    
    // Debug log
    if (Math.random() < 0.01) {
      console.log(`Position: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`);
      console.log(`Direction: ${direction.x.toFixed(2)}, ${direction.z.toFixed(2)}`);
      console.log(`Velocity: ${velocity.x.toFixed(2)}, ${velocity.z.toFixed(2)}`);
      console.log(`Controls locked: ${controls.isLocked}`);
    }
  }
  
  renderer.render(scene, camera);
}

// Run the code
init();
animate();