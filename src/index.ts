import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import earthDayMapUrl from './assets/2k_earth_daymap.jpg?url';
import earthNormalMapUrl from './assets/2k_earth_normal_map.jpg?url';
import earthCloudsUrl from './assets/2k_earth_clouds.jpg?url';

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Setup loading manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onError = function(url) {
    console.error('Error loading', url);
};
loadingManager.onLoad = function() {
    console.log('All textures loaded successfully');
};
loadingManager.onProgress = function(url) {
    console.log('Loading:', url);
};

const geometry = new THREE.SphereGeometry(1, 32, 32);
const textureLoader = new THREE.TextureLoader(loadingManager);

// Add more detailed error handling
const loadTexture = (path: string): Promise<THREE.Texture> => {
    return new Promise((resolve, reject) => {
        textureLoader.load(
            path,
            (texture) => {
                console.log(`Successfully loaded ${path}`);
                resolve(texture);
            },
            undefined,
            (error) => {
                console.error(`Error loading ${path}:`, error);
                reject(error);
            }
        );
    });
};

// Move these outside init() so they're accessible in animate()
let earth: THREE.Mesh;
let clouds: THREE.Mesh;

async function init() {
    try {
        const earthTexture = await loadTexture(earthDayMapUrl);
        const normalMap = await loadTexture(earthNormalMapUrl);
        const cloudTexture = await loadTexture(earthCloudsUrl);

        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            normalMap: normalMap,
            shininess: 15,
            normalScale: new THREE.Vector2(0.8, 0.8),
        });

        earth = new THREE.Mesh(geometry, material);
        scene.add(earth);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 3);
        pointLight.position.set(5, 3, 5);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xffffff, 2);
        pointLight2.position.set(-5, -3, -5);
        scene.add(pointLight2);

        // Stars
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff,
            size: 0.2,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        const starVertices = [];
        for (let i = 0; i < 50000; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 30 + Math.random() * 1000;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Clouds
        const cloudGeometry = new THREE.SphereGeometry(1.01, 32, 32);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.2,
            depthWrite: false
        });
        clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        scene.add(clouds);

        // Start animation only after everything is loaded
        animate();
    } catch (error) {
        console.error('Failed to load textures:', error);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (earth && clouds) {  // Check if objects exist before rotating
        earth.rotation.y += 0.001;
        clouds.rotation.y += 0.0005;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Only call init(), animate() will be called after textures load
init();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
  
