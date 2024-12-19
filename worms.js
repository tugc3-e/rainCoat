import * as THREE from 'three';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161/examples/jsm/loaders/FontLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 400;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Video Background
const video = document.createElement("video");
video.src = "./worms/worms.mp4"; // Path to video
video.autoplay = true;
video.loop = true;
video.muted = true; // Muting for autoplay
video.play();

const videoTexture = new THREE.VideoTexture(video);
const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
const videoGeometry = new THREE.PlaneGeometry(1280, 1180);
videoGeometry.scale(1, window.innerHeight / window.innerWidth, 1);
const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
scene.add(videoMesh);

// Load the "CLICK" text
const loader = new FontLoader();
loader.load(
  "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json", // Font URL
  (font) => {
    const textGeometry = new THREE.TextGeometry("CLICK", {
      font: font,
      size: 1250,
      height: 1179,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: "blue" });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Position text on screen
    textMesh.position.set(0, 250, -300); // Adjust position as needed
    scene.add(textMesh);
  }
);

// Photos Array (H1.JPG to H8.JPG)
const photoTextures = [
  new THREE.TextureLoader().load("./worms/H1.JPG"),
  new THREE.TextureLoader().load("./worms/H2.JPG"),
  new THREE.TextureLoader().load("./worms/H3.JPG"),
  new THREE.TextureLoader().load("./worms/H5.JPG"),
  new THREE.TextureLoader().load("./worms/H6.JPG"),
  new THREE.TextureLoader().load("./worms/H7.JPG"),
  new THREE.TextureLoader().load("./worms/H8.JPG"),
];

let currentPhotoIndex = 0;
let showingPhoto = false;

const photoMaterial = new THREE.MeshBasicMaterial({
  map: photoTextures[currentPhotoIndex],
  transparent: true,
});
const photoGeometry = new THREE.PlaneGeometry(1200, 1150);
photoGeometry.scale(1, window.innerHeight / window.innerWidth, 1);
const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);

// Mouse Click Event
window.addEventListener("click", () => {
  if (!showingPhoto) {
    // Show next photo
    currentPhotoIndex = (currentPhotoIndex + 1) % photoTextures.length;
    photoMaterial.map = photoTextures[currentPhotoIndex];
    scene.add(photoMesh);
    showingPhoto = true;

    // Remove photo after 0.5 seconds
    setTimeout(() => {
      scene.remove(photoMesh);
      showingPhoto = false;
    }, 1800);
  }
});

// Add a constant image that stays on top of video (but behind other objects)
const overlayTexture = new THREE.TextureLoader().load("./worms/click.png"); // Replace with your image path
const overlayMaterial = new THREE.MeshBasicMaterial({
  map: overlayTexture,
  transparent: true, // Make sure the image is transparent where needed
});

const overlayGeometry = new THREE.PlaneGeometry(1280, 1180);
overlayGeometry.scale(1, window.innerHeight / window.innerWidth, 1);
const overlayMesh = new THREE.Mesh(overlayGeometry, overlayMaterial);
overlayMesh.position.z = -75; // Ensures it's behind the text and other objects but on top of the video

scene.add(overlayMesh);

// Resize Event
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
