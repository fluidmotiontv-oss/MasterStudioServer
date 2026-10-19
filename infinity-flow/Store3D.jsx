import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Store3D() {
  const mountRef = useRef(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [cartStatus, setCartStatus] = useState('');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030305);
    scene.fog = new THREE.FogExp2(0x030305, 0.035);

    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.6);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x00ffcc, 3, 20);
    cyanPoint.position.set(-3, 3, -1);
    scene.add(cyanPoint);

    const magentaPoint = new THREE.PointLight(0xff00aa, 3, 20);
    magentaPoint.position.set(3, 3, -1);
    scene.add(magentaPoint);

    const underShelfLight = new THREE.PointLight(0x00aaff, 2, 10);
    underShelfLight.position.set(0, 0.8, -3);
    scene.add(underShelfLight);

    // Room Environment (Walk-in Gallery)
    const roomGroup = new THREE.Group();

    // Floor with grid aesthetic
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.4, metalness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Back Display Wall
    const wallGeo = new THREE.BoxGeometry(16, 8, 0.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x12121a, roughness: 0.7 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 4, -5);
    roomGroup.add(wall);

    // Floating Glass Shelves
    const shelfGeo = new THREE.BoxGeometry(10, 0.15, 1.2);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.9, emissive: 0x00ffcc, emissiveIntensity: 0.2 });
    
    const shelf1 = new THREE.Mesh(shelfGeo, shelfMat);
    shelf1.position.set(0, 2.0, -3.5);
    roomGroup.add(shelf1);

    const shelf2 = new THREE.Mesh(shelfGeo, shelfMat);
    shelf2.position.set(0, 0.9, -3.5);
    roomGroup.add(shelf2);

    // 6 3D Books on Display (Representing Tiers 3, 6, 9)
    const bookGeo = new THREE.BoxGeometry(0.7, 1.0, 0.18);
    const bookColors = [0x00ffcc, 0xff00aa, 0x00aaff, 0xffaa00, 0xaa00ff, 0x00ff66];
    const books = [];

    for (let i = 0; i < 6; i++) {
      const mat = new THREE.MeshStandardMaterial({ 
        color: bookColors[i], 
        roughness: 0.2, 
        metalness: 0.5,
        emissive: bookColors[i],
        emissiveIntensity: 0.15
      });
      const book = new THREE.Mesh(bookGeo, mat);
      const xPos = (i % 3 - 1) * 2.5;
      const yPos = i < 3 ? 2.6 : 1.5;
      book.position.set(xPos, yPos, -3.4);
      book.castShadow = true;
      roomGroup.add(book);
      books.push(book);
    }

    // Super Puff Character & Banner Mesh
    const puffGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const puffMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff4400, emissiveIntensity: 0.9, roughness: 0.2 });
    const superPuff = new THREE.Mesh(puffGeo, puffMat);
    superPuff.position.set(-6, 3, -2);
    scene.add(superPuff);

    // Banner Plane trailing Super Puff
    const bannerGeo = new THREE.PlaneGeometry(3.5, 0.6);
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const ctx = bannerCanvas.getContext('2d');
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, 512, 128);
    ctx.fillStyle = '#ff00aa';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ viva la resolution ✨', 256, 64);

    const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTexture, side: THREE.DoubleSide, transparent: true });
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(-1.8, 0, 0);
    superPuff.add(bannerMesh);

    scene.add(roomGroup);

    // Interactive Raycasting for Book Clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(books);
      if (intersects.length > 0) {
        const index = books.indexOf(intersects[0].object);
        setSelectedBook(`Infinity Ebook Tier ${index + 1} ($3 Edition + 50% Upgrade Token)`);
      }
    };
    window.addEventListener('click', handleClick);

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

      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.05;
      camera.position.y += (1.6 + mouseY * 0.15 - camera.position.y) * 0.05;
      camera.lookAt(0, 1.8, -4);

      books.forEach((book, index) => {
        book.position.y = (index < 3 ? 2.6 : 1.5) + Math.sin(elapsedTime * 2 + index) * 0.05;
        book.rotation.y = Math.sin(elapsedTime * 0.8 + index) * 0.15;
      });

      superPuff.position.x = Math.sin(elapsedTime * 0.7) * 5.5;
      superPuff.position.y = 2.8 + Math.cos(elapsedTime * 1.4) * 0.3;
      superPuff.position.z = Math.cos(elapsedTime * 0.7) * 3 - 1;
      superPuff.rotation.y = elapsedTime;

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
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleCheckout = () => {
    setCartStatus('Redirecting to secure PayPal checkout for $54 Master Bundle...');
    setTimeout(() => {
      window.location.href = 'https://paypal.me/fluidmotion/54';
    }, 1200);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#030305', overflow: 'hidden', fontFamily: 'monospace' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Header & Viva la Resolution Banner */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', color: '#00ffcc', zIndex: 10, pointerEvents: 'none', textShadow: '0 0 10px rgba(0,255,204,0.5)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '3px' }}>INFINITY STORE // WALK-IN 3D</h1>
        <p style={{ margin: '6px 0 0 0', color: '#ff00aa', fontSize: '1rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,0,170,0.5)' }}>✨ viva la resolution ✨</p>
      </div>

      {/* Interactive Selection Notice */}
      {selectedBook && (
        <div style={{ position: 'absolute', bottom: '30px', left: '30px', background: 'rgba(0,255,204,0.1)', border: '1px solid #00ffcc', padding: '15px 25px', borderRadius: '8px', color: '#00ffcc', zIndex: 10, backdropFilter: 'blur(6px)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>📖 Inspected: {selectedBook}</p>
        </div>
      )}

      {/* Embedded Infinity Store HUD */}
      <div style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(10, 10, 18, 0.85)', border: '1px solid #00ffcc', padding: '24px', borderRadius: '12px', color: '#ffffff', zIndex: 10, width: '340px', boxShadow: '0 0 30px rgba(0,255,204,0.25)', backdropFilter: 'blur(10px)' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#00ffcc', fontSize: '1.2rem', borderBottom: '1px solid #22223b', paddingBottom: '10px', letterSpacing: '1px' }}>🛍️ Infinity Store Hub</h3>
        <div style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#ff00aa' }}>$54 Master Bundle Tier</p>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#b8b8d0', lineHeight: '1.4' }}>18 Ebooks total ($3 each across 3, 6, 9 tiers) + digital stocking stuffers.</p>
        </div>
        <div style={{ marginBottom: '18px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#00aaff' }}>🎁 Gift & Upgrade Perk</p>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#b8b8d0', lineHeight: '1.4' }}>Every gifted book grants recipients a 50% OFF next purchase upgrade token!</p>
        </div>
        
        {cartStatus ? (
          <p style={{ color: '#00ffcc', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', margin: '10px 0' }}>{cartStatus}</p>
        ) : (
          <button 
            onClick={handleCheckout}
            style={{ width: '100%', background: 'linear-gradient(135deg, #00ffcc, #00aaff)', color: '#030305', border: 'none', padding: '12px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', letterSpacing: '1px', boxShadow: '0 0 15px rgba(0,255,204,0.4)', transition: 'transform 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Unlock Master Bundle ($54)
          </button>
        )}
      </div>
    </div>
  );
}
