import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { OBJLoader } from "jsm/loaders/OBJLoader.js";

const w = window.innerWidth;
const h = window.innerHeight;

// 1. Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);

// Initial camera position
camera.position.set(0, 0, 350); 

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// 2. OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; 
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5; 
controls.target.set(0, 0, 0); 
controls.update();

// 3. Background
const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load("https://drive.google.com/file/d/13CMo8p16oVpDgFRzOyRRtQhOtqjfuyWO/view");
const backgroundGeometry = new THREE.SphereGeometry(500, 60, 40);
backgroundGeometry.scale(-1, 1, 1);
const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture });
const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(backgroundMesh);

// 4. Load OBJ Models
const objLoader = new OBJLoader();
const models = [];

function loadModel(path, position, scale) {
  objLoader.load(
    path,
    (object) => {
      object.position.set(position.x, position.y, position.z);
      object.scale.set(scale.x, scale.y, scale.z);
      scene.add(object);
      models.push(object);
    },
    undefined,
    (error) => {
      console.error("Error loading model:", error);
    }
  );
}

loadModel("./models/model1.obj", { x: -100, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
loadModel("./models/model2.obj", { x: 100, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
loadModel("./models/model3.obj", { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });

// 5. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
directionalLight.position.set(2, 2, 5);
scene.add(directionalLight);

// Fish Button
const fishTexture = textureLoader.load("./textures/fish002.png");

const fishMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uTexture: { value: fishTexture },
    uExposure: { value: 0.9 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uExposure;
    varying vec2 vUv;

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      texColor.rgb *= uExposure; 
      if (texColor.a < 0.1) discard; 
      gl_FragColor = texColor;
    }
  `,
});

const fishGeometry = new THREE.PlaneGeometry(100, 50);
const fishPlane = new THREE.Mesh(fishGeometry, fishMaterial);
fishPlane.position.set(300, 200, -44);
scene.add(fishPlane);

// Raycaster and Mouse for Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isHoveringFish = false;

function onMouseMove(event) {
  // Update mouse coordinates to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set the raycaster to cast from the camera through the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check for intersection with the fish plane
  const intersects = raycaster.intersectObject(fishPlane);

  if (intersects.length > 0) {
    if (!isHoveringFish) {
      // Mouse enters the fish plane area
      isHoveringFish = true;
      fishPlane.scale.set(1.1, 1.1, 1); // Slightly enlarge the plane
      document.body.style.cursor = "pointer"; // Change cursor to pointer
    }
  } else if (isHoveringFish) {
    // Mouse leaves the fish plane area
    isHoveringFish = false;
    fishPlane.scale.set(1, 1, 1); // Reset the plane size
    document.body.style.cursor = "default"; // Reset cursor
  }
}

function onMouseDown(event) {
  event.preventDefault();

  // Check if the fish plane was clicked
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(fishPlane);

  if (intersects.length > 0) {
    // Redirect to fisheye.html
    window.location.href = "fisheye.html";
  }
}

// Attach event listeners
document.addEventListener("mousemove", onMouseMove, false);
document.addEventListener("mousedown", onMouseDown, false);



// 7. Video Texture
const video = document.createElement("video");
video.src = "./videos/raincoatf.mp4";
video.loop = true;
video.muted = true;
video.play();

const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat;

const videoMaterial = new THREE.MeshBasicMaterial({
  map: videoTexture,
  side: THREE.DoubleSide,
});

const videoGeometry = new THREE.PlaneGeometry(390, 110);
const videoPlane = new THREE.Mesh(videoGeometry, videoMaterial);

videoPlane.rotation.x = -Math.PI / 1;
videoPlane.position.set(0, -150, 1);
scene.add(videoPlane);

// 7.2. Add Overlay JPG on Video
const overlayTexture = textureLoader.load("./textures/click.png"); // Your JPG file path
const overlayMaterial = new THREE.MeshBasicMaterial({
  map: overlayTexture,
  transparent: true, // Allow transparency
  opacity: 1,        // Initial opacity
  side: THREE.DoubleSide,
});

const overlayGeometry = new THREE.PlaneGeometry(58, 19);
const overlayPlane = new THREE.Mesh(overlayGeometry, overlayMaterial);
overlayPlane.position.copy(videoPlane.position); // Same position as videoPlane
overlayPlane.position.z += 0.1; // Slightly in front of the video plane
scene.add(overlayPlane);

// 7.3. Add Blinking Effect for Overlay
let overlayOpacityDirection = -1; // For alternating opacity
function updateOverlayOpacity() {
  overlayMaterial.opacity += overlayOpacityDirection * 0.05; // Change opacity
  if (overlayMaterial.opacity <= 0.3 || overlayMaterial.opacity >= 1) {
    overlayOpacityDirection *= -1; // Reverse direction
  }
}

// 7.4. Add Interaction for Video and Overlay
function onVideoMouseDown(event) {
  event.preventDefault();

  // Check if the video plane or overlay was clicked
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([videoPlane, overlayPlane]);

  if (intersects.length > 0) {
    // Redirect to worms.html
    window.location.href = "worms.html";
  }
}

// Attach the new event listener for clicking
document.addEventListener("mousedown", onVideoMouseDown, false);

// Update the animation loop to include the blinking effect
function animate() {
  requestAnimationFrame(animate);

  // Load the new JPEG texture for the button
const jpegTexture = textureLoader.load("./textures/click2.png"); // Your JPEG file path
const jpegMaterial = new THREE.MeshBasicMaterial({
  map: jpegTexture,
  transparent: true,
  opacity: 1,
  side: THREE.DoubleSide,
});

// Geometry and mesh for the new button
const jpegGeometry = new THREE.PlaneGeometry(60, 18);
const jpegPlane = new THREE.Mesh(jpegGeometry, jpegMaterial);
jpegPlane.position.set(-300, 200, -44); // Position for the new button
scene.add(jpegPlane);

// Blinking effect for the new button
let jpegOpacityDirection = 1;
function updateJpegOpacity() {
  jpegMaterial.opacity += jpegOpacityDirection * 0.5;
  if (jpegMaterial.opacity <= 1 || jpegMaterial.opacity >= 1) {
    jpegOpacityDirection *= -1;
  }
}

// Interaction for the new button
function onJpegMouseDown(event) {
  event.preventDefault();

  // Check if the JPEG plane was clicked
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(jpegPlane);

  if (intersects.length > 0) {
    // Redirect to the Google search page
    window.location.href =
      "https://www.google.com/search?sca_esv=6ed7b9508758552f&rlz=1C5OZZY_enGB1136GB1138&sxsrf=ADLYWIIFjECjlt7MHkYMsah1iso2L8Obiw:1734549488590&q=palestine+flag&udm=2&fbs=AEQNm0APE89G33kFGzImMw4YMLSxCv-qT2Xiwl6UZIx3nI268mTq33R0yC9xiegFTTwI_26kUAfYmNUFNFIW7CgL6QpS3w7EnI0oIq8iYLzInOm_LILGTNphCOAbkxoAkJHkvacJpJtTr4Ns4lrgiyV3-Gm8t-sVBotUYopr4pKtDYWpiJuZbICxB2wk-A50SG_d4T4CiQY9dxv7o_82wQ08sD2EJMvLjEZLQuko1qLnHq8d5isrzzA&sa=X&ved=2ahUKEwiCivOwhLKKAxXaUUEAHfWTPckQtKgLegQIFBAB&biw=1512&bih=823&dpr=2";
  }
}

// Attach event listener for the new button
document.addEventListener("mousedown", onJpegMouseDown, false);

// Update the animation loop to include the blinking effect for the new button
function animate() {
  requestAnimationFrame(animate);

  // Rotate OBJ Models
  models.forEach((model) => {
    model.rotation.y += 0.01;
    model.rotation.x += 0.005;
  });

  // Update controls, render, and blinking effects
  controls.update();
  updateOverlayOpacity(); // Existing overlay blinking
  updateJpegOpacity(); // New button blinking
  renderer.render(scene, camera);
}
animate();

  // Rotate OBJ Models
  models.forEach((model) => {
    model.rotation.y += 0.0000001; 
    model.rotation.x += 0.0000005; 
  });

  // Update controls and render
  controls.update(); 
  updateOverlayOpacity(); // Update blinking effect
  renderer.render(scene, camera);
}
animate();



