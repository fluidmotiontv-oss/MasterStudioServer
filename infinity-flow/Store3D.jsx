import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Store3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    
    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffcc, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create 3D Display Pedestals & Products
    const group = new THREE.Group();
    
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x112233, roughness: 0.3, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x331122, roughness: 0.3, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x113322, roughness: 0.3, metalness: 0.8 })
    ];

    const cubes = [];
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(geometry, materials[i]);
      mesh.position.set((i - 1) * 3, 0, 0);
      group.add(mesh);
      cubes.push(mesh);
    }
    scene.add(group);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      cubes.forEach((cube, index) => {
        cube.rotation.x += 0.005 * (index + 1);
        cube.rotation.y += 0.008 * (index + 1);
      });
      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0a0a0f', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#00ffcc', fontFamily: 'monospace', zIndex: 10 }}>
        <h2>Infinity Flow // 3D Spatial Store</h2>
        <p>Interactive Product Showcase powered by Three.js</p>
      </div>
    </div>
  );
}
