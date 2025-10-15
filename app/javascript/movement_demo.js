import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

document.addEventListener('DOMContentLoaded', () => {
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
  let isPaused = false;
  
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
    });
    
    controls.addEventListener('unlock', () => {
      crosshair.style.display = 'none';
      if (!isPaused) {
        startScreen.style.display = 'flex';
      }
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
        case 'Escape':
          if (controls.isLocked) {
            event.preventDefault();
            togglePause();
          }
          break;
      }
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
    
    // Create pause menu
    createPauseMenu();
  }
  
  function createPauseMenu() {
    const pauseMenu = document.createElement('div');
    pauseMenu.id = 'pause-menu';
    pauseMenu.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.9);
      padding: 40px;
      border-radius: 10px;
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 20;
      min-width: 300px;
    `;
    
    const title = document.createElement('h1');
    title.textContent = 'PAUSED';
    title.style.cssText = `
      color: white;
      font-size: 48px;
      margin-bottom: 40px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    pauseMenu.appendChild(title);
    
    const resumeButton = document.createElement('button');
    resumeButton.textContent = 'Resume';
    resumeButton.style.cssText = `
      padding: 12px 24px;
      margin: 10px;
      font-size: 18px;
      background: linear-gradient(to bottom, #4e73df, #224abe);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    resumeButton.addEventListener('click', (e) => {
      e.preventDefault();
      togglePause();
    });
    pauseMenu.appendChild(resumeButton);
    
    container.appendChild(pauseMenu);
  }
  
  function togglePause() {
    isPaused = !isPaused;
    const pauseMenu = document.getElementById('pause-menu');
    
    if (isPaused) {
      pauseMenu.style.display = 'flex';
      controls.unlock();
    } else {
      pauseMenu.style.display = 'none';
      controls.lock();
    }
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
      
      prevTime = time;
    }
    
    // Render the scene
    renderer.render(scene, camera);
  }
});