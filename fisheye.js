import * as THREE from "three";

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 300;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load textures (36 photos for the slideshow)
const textureLoader = new THREE.TextureLoader();
const photos = [];
for (let i = 1; i <= 39; i++) {
  photos.push(textureLoader.load(`./photos/1.png`));
  photos.push(textureLoader.load(`./photos/2.png`));
  photos.push(textureLoader.load(`./photos/3.png`));
  photos.push(textureLoader.load(`./photos/4.png`));
  photos.push(textureLoader.load(`./photos/4.1.png`));
  photos.push(textureLoader.load(`./photos/5.png`));
  photos.push(textureLoader.load(`./photos/6.png`));
  photos.push(textureLoader.load(`./photos/7.jpg`));
  photos.push(textureLoader.load(`./photos/8.png`));
  photos.push(textureLoader.load(`./photos/9.png`));
  photos.push(textureLoader.load(`./photos/10.png`));
  photos.push(textureLoader.load(`./photos/11.jpg`));
  photos.push(textureLoader.load(`./photos/12.png`));
  photos.push(textureLoader.load(`./photos/13.png`));
  photos.push(textureLoader.load(`./photos/14.png`));
  photos.push(textureLoader.load(`./photos/15.jpg`));
  photos.push(textureLoader.load(`./photos/16.png`));
  photos.push(textureLoader.load(`./photos/16.1.png`));
  photos.push(textureLoader.load(`./photos/17.png`));
  photos.push(textureLoader.load(`./photos/18.png`));
  photos.push(textureLoader.load(`./photos/19.png`));
  photos.push(textureLoader.load(`./photos/20.jpg`));
  photos.push(textureLoader.load(`./photos/21.png`));
  photos.push(textureLoader.load(`./photos/22.png`));
  photos.push(textureLoader.load(`./photos/23.png`));
  photos.push(textureLoader.load(`./photos/24.png`));
  photos.push(textureLoader.load(`./photos/24.1.png`));
  photos.push(textureLoader.load(`./photos/25.jpg`));
  photos.push(textureLoader.load(`./photos/26.png`));
  photos.push(textureLoader.load(`./photos/27.png`));
  photos.push(textureLoader.load(`./photos/28.png`));
  photos.push(textureLoader.load(`./photos/29.png`));
  photos.push(textureLoader.load(`./photos/30.png`));
  photos.push(textureLoader.load(`./photos/31.png`));
  photos.push(textureLoader.load(`./photos/32.png`));
  photos.push(textureLoader.load(`./photos/33.png`));
  photos.push(textureLoader.load(`./photos/34.png`));
  photos.push(textureLoader.load(`./photos/35.png`));
  photos.push(textureLoader.load(`./photos/36.png`)); // Replace with your photo paths
}

// Fisheye geometry
const fisheyeGeometry = new THREE.SphereGeometry(150, 64, 64);
fisheyeGeometry.scale(-1, 1, 1); // Invert the sphere to create a fisheye effect

const fisheyeMaterial = new THREE.MeshBasicMaterial({
  map: photos[0], // Start with the first photo
});

const fisheye = new THREE.Mesh(fisheyeGeometry, fisheyeMaterial);
scene.add(fisheye);

// Rotate fisheye over time
function animate() {
  requestAnimationFrame(animate);

  // Optional: Slowly rotate the fisheye
  fisheye.rotation.y += 0.002;

  renderer.render(scene, camera);
}
animate();

// Photo slideshow logic
let currentPhotoIndex = 0;

function changePhoto() {
  currentPhotoIndex = (currentPhotoIndex + 1) % photos.length; // Loop through photos
  fisheyeMaterial.map = photos[currentPhotoIndex]; // Update texture
  fisheyeMaterial.map.needsUpdate = true;
}

// Change photo every 3 seconds
setInterval(changePhoto, 21500);

// Handle window resize
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize);
