import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Store3D() {
  const mountRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartStatus, setCartStatus] = useState('');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020508);
    scene.fog = new THREE.FogExp2(0x020508, 0.025);

    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Dynamic Coastal Lighting
    const ambientLight = new THREE.AmbientLight(0x112244, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa55, 2.2);
    sunLight.position.set(15, 20, -15);
    scene.add(sunLight);

    const interiorGlow = new THREE.PointLight(0x00ffcc, 2.5, 20);
    interiorGlow.position.set(0, 3, -1);
    scene.add(interiorGlow);

    const surfMegaLight = new THREE.PointLight(0xff00aa, 3, 15);
    surfMegaLight.position.set(5, 3, -2);
    scene.add(surfMegaLight);

    const galleryLight = new THREE.PointLight(0x00aaff, 3, 15);
    galleryLight.position.set(-5, 3, -2);
    scene.add(galleryLight);

    // Room & Compound Structure
    const roomGroup = new THREE.Group();

    // Central Timber Deck Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.7, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Left Wing: Gallery Spaces
    const galleryGeo = new THREE.BoxGeometry(6, 5, 8);
    const galleryMat = new THREE.MeshStandardMaterial({ color: 0x0a1118, roughness: 0.5 });
    const galleryWing = new THREE.Mesh(galleryGeo, galleryMat);
    galleryWing.position.set(-7, 2.5, -4);
    roomGroup.add(galleryWing);

    // Right Wing: Surf / Skate / Snow / Wake Megastore
    const megaGeo = new THREE.BoxGeometry(6, 5, 8);
    const megaMat = new THREE.MeshStandardMaterial({ color: 0x180a18, roughness: 0.5 });
    const megaWing = new THREE.Mesh(megaGeo, megaMat);
    megaWing.position.set(7, 2.5, -4);
    roomGroup.add(megaWing);

    // Open Back Wall / Glass Frame looking out to Perfect Waves & Dunes
    const horizonGeo = new THREE.PlaneGeometry(60, 25);
    const horizonMat = new THREE.MeshStandardMaterial({ color: 0x05101a, roughness: 0.9, emissive: 0x01050a });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.position.set(0, 4, -25);
    roomGroup.add(horizon);

    // Perfect Ocean Waves rolling in at the back
    const oceanGeo = new THREE.PlaneGeometry(60, 30);
    const oceanMat = new THREE.MeshStandardMaterial({ color: 0x005577, roughness: 0.15, metalness: 0.85, emissive: 0x003344, emissiveIntensity: 0.5 });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, -0.1, -25);
    roomGroup.add(ocean);

    // Subterranean Glass Tunnel diving into the sea
    const tunnelGeo = new THREE.CylinderGeometry(1.2, 1.2, 20, 32, 1, true);
    const tunnelMat = new THREE.MeshStandardMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.3, roughness: 0.1, side: THREE.DoubleSide });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.x = Math.PI / 2;
    tunnel.position.set(0, -0.5, -10);
    roomGroup.add(tunnel);

    // Interactive Display Objects (Books on left gallery, Gear/Apparel on right megastore)
    const items = [];
    
    // Gallery Art/Book Displays (Left)
    for (let i = 0; i < 3; i++) {
      const artGeo = new THREE.BoxGeometry(0.8, 1.1, 0.15);
      const artMat = new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.2, emissive: 0x00aaff, emissiveIntensity: 0.3 });
      const artMesh = new THREE.Mesh(artGeo, artMat);
      artMesh.position.set(-5.5 + i * 1.2, 2.5, -3.8);
      artMesh.castShadow = true;
      roomGroup.add(artMesh);
      items.push({ mesh: artMesh, name: `Gallery Art Piece / Ebook Tier ${i + 1}` });
    }

    // Megastore Surf/Snow/Wake/Skate Gear & Apparel Displays (Right)
    const gearColors = [0xff00aa, 0xffaa00, 0x00ff66];
    const gearNames = ['Surf & Foil Pro Rig', 'Snow & Wake Carbon Setup', 'Extreme Apparel Bundle'];
    for (let i = 0; i < 3; i++) {
      const gearGeo = new THREE.BoxGeometry(0.9, 1.2, 0.2);
      const gearMat = new THREE.MeshStandardMaterial({ color: gearColors[i], roughness: 0.2, emissive: gearColors[i], emissiveIntensity: 0.3 });
      const gearMesh = new THREE.Mesh(gearGeo, gearMat);
      gearMesh.position.set(4.3 + i * 1.2, 2.5, -3.8);
      gearMesh.castShadow = true;
      roomGroup.add(gearMesh);
      items.push({ mesh: gearMesh, name: gearNames[i] });
    }

    // Super Puff Character & Banner Mesh
    const puffGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const puffMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff4400, emissiveIntensity: 0.9, roughness: 0.2 });
    const superPuff = new THREE.Mesh(puffGeo, puffMat);
    superPuff.position.set(-6, 3, -1);
    scene.add(superPuff);

    // Banner Plane trailing Super Puff
    const bannerGeo = new THREE.PlaneGeometry(3.5, 0.6);
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const ctx = bannerCanvas.getContext('2d');
    ctx.fillStyle = '#020508';
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

    // Raycasting for item inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = items.map(it => it.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const found = items.find(it => it.mesh === intersects[0].object);
        if (found) setSelectedItem(found.name);
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

      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (1.8 + mouseY * 0.15 - camera.position.y) * 0.05;
      camera.lookAt(0, 1.6, -6);

      items.forEach((item, index) => {
        item.mesh.position.y = 2.5 + Math.sin(elapsedTime * 2 + index) * 0.04;
      });

      superPuff.position.x = Math.sin(elapsedTime * 0.7) * 6;
      superPuff.position.y = 2.8 + Math.cos(elapsedTime * 1.4) * 0.3;
      superPuff.position.z = Math.cos(elapsedTime * 0.7) * 3 - 3;
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
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#020508', overflow: 'hidden', fontFamily: 'monospace' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Header & Viva la Resolution Banner */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', color: '#00ffcc', zIndex: 10, pointerEvents: 'none', textShadow: '0 0 10px rgba(0,255,204,0.5)' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '2px' }}>INFINITY STORE // MEGASTORE & GALLERY DECK</h1>
        <p style={{ margin: '6px 0 0 0', color: '#ff00aa', fontSize: '1rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,0,170,0.5)' }}>✨ viva la resolution ✨</p>
      </div>

      {/* Interactive Selection Notice */}
      {selectedItem && (
        <div style={{ position: 'absolute', bottom: '30px', left: '30px', background: 'rgba(0,255,204,0.1)', border: '1px solid #00ffcc', padding: '15px 25px', borderRadius: '8px', color: '#00ffcc', zIndex: 10, backdropFilter: 'blur(6px)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>⚡ Inspected: {selectedItem}</p>
        </div>
      )}

      {/* Embedded Infinity Store HUD */}
      <div style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(10, 10, 18, 0.85)', border: '1px solid #00ffcc', padding: '24px', borderRadius: '12px', color: '#ffffff', zIndex: 10, width: '340px', boxShadow: '0 0 30px rgba(0,255,204,0.25)', backdropFilter: 'blur(10px)' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#00ffcc', fontSize: '1.2rem', borderBottom: '1px solid #22223b', paddingBottom: '10px', letterSpacing: '1px' }}>🛍️ Infinity Store Hub</h3>
        <div style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#ff00aa' }}>$54 Master Bundle Tier</p>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#b8b8d0', lineHeight: '1.4' }}>18 Ebooks ($3 each across 3, 6, 9) + Megastore Gear Access + Stocking Stuffers.</p>
        </div>
        <div style={{ marginBottom: '18px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#00aaff' }}>🎁 Gift & Upgrade Perk</p>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#b8b8d0', lineHeight: '1.4' }}>Every gifted item unlocks a 50% OFF next purchase upgrade token!</p>
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
