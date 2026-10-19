import * as THREE from 'three';
import { InfinityFlowTouchEngine } from './InfinityFlowEngine.js';
import { InfinityFlowBiometrics } from './InfinityFlowBiometrics.js';

const container = document.getElementById('canvas-container');
const statusText = document.getElementById('status-display');

// Setup Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4.5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Add Ambient & Point Lighting for Rich Depth
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x52b788, 2, 10);
pointLight.position.set(2, 2, 2);
scene.add(pointLight);

// Custom Biometric Shader Material (Lemniscate Flow Vibe)
const flowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0.0 },
        uHeartRate: { value: 72.0 },
        uBreathFactor: { value: 0.6 }
    },
    vertexShader: `
        uniform float uTime;
        uniform float uHeartRate;
        uniform float uBreathFactor;
        varying vec2 vUv;
        varying float vDisplacement;

        void main() {
            vUv = uv;
            float pulseFreq = uHeartRate / 60.0;
            float displacement = sin(position.x * 4.0 + uTime * pulseFreq * 2.0) * cos(position.y * 4.0 + uTime) * uBreathFactor * 0.25;
            vDisplacement = displacement;
            vec3 newPos = position + normal * displacement;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vDisplacement;

        void main() {
            vec3 colDeep = vec3(0.05, 0.15, 0.25);
            vec3 colPulse = vec3(0.32, 0.72, 0.53);
            vec3 finalCol = mix(colDeep, colPulse, vDisplacement + 0.5 + sin(uTime * 0.5) * 0.1);
            gl_FragColor = vec4(finalCol, 0.92);
        }
    `,
    transparent: true,
    wireframe: false
});

// Create Torus Knot (Lemniscate Geometry)
const geometry = new THREE.TorusKnotGeometry(1.1, 0.38, 128, 32);
const flowMesh = new THREE.Mesh(geometry, flowMaterial);
scene.add(flowMesh);

// Add Particle Field for Immersive Depth
const particleCount = 300;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 10;
    particlePositions[i+1] = (Math.random() - 0.5) * 10;
    particlePositions[i+2] = (Math.random() - 0.5) * 10;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0x94d2bd, size: 0.04, transparent: true, opacity: 0.6 });
const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleSystem);

// Initialize Touch Physics Engine
const touchEngine = new InfinityFlowTouchEngine(container, {
    damping: 0.90,
    sensitivity: 0.008
});

touchEngine.onUpdate = (state) => {
    flowMesh.rotation.y = state.x;
    flowMesh.rotation.x = state.y;
    particleSystem.rotation.y = state.x * 0.2;
    camera.zoom = state.zoom;
    camera.updateProjectionMatrix();
    
    if (state.isMoving) {
        statusText.innerText = `Status: Interacting (Zoom: ${state.zoom.toFixed(2)})`;
    }
};

// Initialize Biometric Bridge
const biometrics = new InfinityFlowBiometrics((data) => {
    if (data.type === 'heartRate') {
        flowMaterial.uniforms.uHeartRate.value = data.value;
        statusText.innerText = `Status: Biometric Linked | HR: ${data.value} BPM`;
    }
});

document.getElementById('connect-btn').addEventListener('click', () => {
    statusText.innerText = "Status: Scanning for Bluetooth Heart Rate monitor...";
    biometrics.connectHeartRateMonitor();
});

document.getElementById('reset-view-btn').addEventListener('click', () => {
    touchEngine.position = { x: 0, y: 0 };
    touchEngine.zoomLevel = 1.0;
    statusText.innerText = "Status: View reset to baseline.";
});

// Main Animation Render Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    
    flowMaterial.uniforms.uTime.value = elapsedTime;
    flowMesh.rotation.z = elapsedTime * 0.05; // Gentle continuous organic drift
    
    renderer.render(scene, camera);
}
animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
