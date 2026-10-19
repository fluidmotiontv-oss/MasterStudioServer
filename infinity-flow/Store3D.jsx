import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Store3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.04);

    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const storeLight = new THREE.PointLight(0x00ffcc, 2.5, 25);
    storeLight.position.set(0, 4, 0);
    scene.add(storeLight);

    const neonAccent = new THREE.PointLight(0xff00aa, 2, 20);
    neonAccent.position.set(0, 2, -3);
    scene.add(neonAccent);

    // Room Structure
    const roomGroup = new THREE.Group();

    // Floor
    const floorGeo = new THREE.PlaneGeometry(15, 15);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.8, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    roomGroup.add(floor);

    // Back Wall Display Shelf
    const shelfGeo = new THREE.BoxGeometry(9, 3.2, 0.5);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x1c1c28, roughness: 0.5 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(0, 1.6, -4);
    roomGroup.add(shelf);

    // 3 3D Books on Display
    const bookGeo = new THREE.BoxGeometry(0.8, 1.2, 0.2);
    const bookMats = [
      new THREE.MeshStandardMaterial({ color: 0x00ffcc, roughness: 0.2, metalness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: 0xff00aa, roughness: 0.2, metalness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.2, metalness: 0.4 })
    ];

    const books = [];
    for (let i = 0; i < 3; i++) {
      const book = new THREE.Mesh(bookGeo, bookMats[i]);
      book.position.set((i - 1) * 2.2, 2.1, -3.7);
      roomGroup.add(book);
      books.push(book);
    }

    // Super Puff Flyby Object
    const puffGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const puffMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff5500, emissiveIntensity: 0.8, roughness: 0.3 });
    const superPuff = new THREE.Mesh(puffGeo, puffMat);
    superPuff.position.set(-6, 3, -2);
    scene.add(superPuff);

    scene.add(roomGroup);

    // Mouse Look Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (1.6 + mouseY * 0.2 - camera.position.y) * 0.05;
      camera.lookAt(0, 1.5, -5);

      books.forEach((book, index) => {
        book.position.y = 2.1 + Math.sin(elapsedTime * 2 + index) * 0.08;
        book.rotation.y = Math.sin(elapsedTime + index) * 0.2;
      });

      superPuff.position.x = Math.sin(elapsedTime * 0.8) * 6;
      superPuff.position.y = 2.8 + Math.cos(elapsedTime * 1.5) * 0.4;
      superPuff.position.z = Math.cos(elapsedTime * 0.8) * 4;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#050508', overflow: 'hidden', fontFamily: 'monospace' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Header & Viva la Resolution Banner */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', color: '#00ffcc', zIndex: 10, pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '2px' }}>INFINITY STORE // WALK-IN 3D</h1>
        <p style={{ margin: '5px 0 0 0', color: '#ff00aa', fontSize: '0.95rem', fontWeight: 'bold' }}>✨ Viva la resolution! ✨</p>
      </div>

      {/* Embedded Infinity Store HUD (Beside Books) */}
      <div style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(10, 10, 15, 0.9)', border: '1px solid #00ffcc', padding: '20px', borderRadius: '10px', color: '#ffffff', zIndex: 10, width: '320px', boxShadow: '0 0 20px rgba(0,255,204,0.2)' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#00ffcc', fontSize: '1.1rem', borderBottom: '1px solid #222', paddingBottom: '8px' }}>🛍️ Infinity Store Hub</h3>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#ff00aa' }}>$54 Master Bundle Tier</p>
          <p style={{ margin: '0', fontSize: '0.8rem', color: '#aaa' }}>18 Ebooks total ($3 each across 3, 6, 9 tiers) + Stocking Stuffers.</p>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 'bold', color: '#00aaff' }}>🎁 Gift & Upgrade Perk</p>
          <p style={{ margin: '0', fontSize: '0.8rem', color: '#aaa' }}>Gifted books unlock 50% OFF next purchase upgrades!</p>
        </div>
        <button style={{ width: '100%', background: '#00ffcc', color: '#050508', border: 'none', padding: '10px', fontWeight: 'bold', borderRadius: '5px', cursor: 'pointer' }}>
          Unlock Master Bundle ($54)
        </button>
      </div>
    </div>
  );
}
