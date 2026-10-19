import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Helper: neon canvas-texture sign
function makeTextTexture(text, color, sub) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 160;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(2,5,10,0.85)';
  x.fillRect(0, 0, 512, 160);
  x.strokeStyle = color; x.lineWidth = 6;
  x.strokeRect(4, 4, 504, 152);
  x.shadowColor = color; x.shadowBlur = 24;
  x.fillStyle = color;
  x.font = 'bold 52px monospace';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, sub ? 62 : 80);
  if (sub) {
    x.font = 'bold 30px monospace';
    x.fillStyle = '#ffffff';
    x.fillText(sub, 256, 118);
  }
  return new THREE.CanvasTexture(c);
}

export default function Store3D() {
  const mountRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartStatus, setCartStatus] = useState('');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020508);
    scene.fog = new THREE.FogExp2(0x020508, 0.018);

    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 4.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambientLight = new THREE.AmbientLight(0x152540, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa55, 2.0);
    sunLight.position.set(15, 25, -10);
    scene.add(sunLight);

    const interiorGlow = new THREE.PointLight(0x00ffcc, 2.5, 18);
    interiorGlow.position.set(0, 3.5, 0);
    scene.add(interiorGlow);

    const surfMegaLight = new THREE.PointLight(0xff00aa, 2.5, 15);
    surfMegaLight.position.set(4, 3, -3);
    scene.add(surfMegaLight);

    const galleryLight = new THREE.PointLight(0x00aaff, 2.5, 15);
    galleryLight.position.set(-4, 3, -3);
    scene.add(galleryLight);

    const roomGroup = new THREE.Group();

    // ── Timber deck floor ──
    const floorGeo = new THREE.PlaneGeometry(24, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.7, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -5);
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Deck plank lines (emissive strips for jazz)
    for (let i = -5; i <= 5; i++) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.03, 30),
        new THREE.MeshBasicMaterial({ color: 0x1a0f08 })
      );
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(i * 1.1, 0.005, -5);
      roomGroup.add(strip);
    }
    // Neon walkway edge strips
    const stripL = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 26), new THREE.MeshBasicMaterial({ color: 0x00ffcc }));
    stripL.rotation.x = -Math.PI / 2; stripL.position.set(-2.6, 0.01, -6); roomGroup.add(stripL);
    const stripR = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 26), new THREE.MeshBasicMaterial({ color: 0xff00aa }));
    stripR.rotation.x = -Math.PI / 2; stripR.position.set(2.6, 0.01, -6); roomGroup.add(stripR);

    // ── Wings ──
    const galleryWing = new THREE.Mesh(
      new THREE.BoxGeometry(5, 4.5, 7),
      new THREE.MeshStandardMaterial({ color: 0x0a1118, roughness: 0.6 })
    );
    galleryWing.position.set(-6, 2.25, -4);
    roomGroup.add(galleryWing);

    const megaWing = new THREE.Mesh(
      new THREE.BoxGeometry(5, 4.5, 7),
      new THREE.MeshStandardMaterial({ color: 0x180a18, roughness: 0.6 })
    );
    megaWing.position.set(6, 2.25, -4);
    roomGroup.add(megaWing);

    // Neon signs on wings
    const gallerySign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 1.05),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('◈ GALLERY', '#00aaff', 'art + ebook tiers'), transparent: true })
    );
    gallerySign.position.set(-6, 3.7, -0.48);
    roomGroup.add(gallerySign);

    const megaSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.05),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('MEGASTORE', '#ff00aa', 'surf · skate · snow · wake'), transparent: true })
    );
    megaSign.position.set(6, 3.7, -0.48);
    roomGroup.add(megaSign);

    // ── Horizon & animated ocean ──
    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 30),
      new THREE.MeshStandardMaterial({ color: 0x040e18, roughness: 0.9, emissive: 0x010306 })
    );
    horizon.position.set(0, 6, -30);
    roomGroup.add(horizon);

    const oceanGeo = new THREE.PlaneGeometry(80, 35, 60, 30);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x004466, roughness: 0.15, metalness: 0.85,
      emissive: 0x002233, emissiveIntensity: 0.4
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, -0.05, -32);
    roomGroup.add(ocean);
    const oceanPos = oceanGeo.attributes.position;
    const oceanBase = oceanPos.array.slice();

    // Rolling peelers — open cylinder shells drifting toward shore
    const crests = [];
    for (let i = 0; i < 3; i++) {
      const crestGeo = new THREE.CylinderGeometry(2.2, 2.2, 70, 32, 1, true, 0, Math.PI * 0.55);
      const crestMat = new THREE.MeshStandardMaterial({
        color: 0x33e0ff, transparent: true, opacity: 0.35,
        emissive: 0x1188aa, emissiveIntensity: 0.6, side: THREE.DoubleSide
      });
      const crest = new THREE.Mesh(crestGeo, crestMat);
      crest.rotation.z = Math.PI / 2;
      crest.rotation.y = Math.PI;
      crest.position.set(0, 0.4, -42 + i * 12);
      roomGroup.add(crest);
      crests.push(crest);
    }

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starArr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starArr[i * 3] = (Math.random() - 0.5) * 120;
      starArr[i * 3 + 1] = 6 + Math.random() * 30;
      starArr[i * 3 + 2] = -25 - Math.random() * 50;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starArr, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.14, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starGeo, starMat);
    roomGroup.add(stars);

    // Floating motes over the deck
    const moteGeo = new THREE.BufferGeometry();
    const moteCount = 150;
    const moteArr = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      moteArr[i * 3] = (Math.random() - 0.5) * 16;
      moteArr[i * 3 + 1] = 0.5 + Math.random() * 4;
      moteArr[i * 3 + 2] = 2 - Math.random() * 14;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(moteArr, 3));
    const moteMat = new THREE.PointsMaterial({ color: 0x00ffcc, size: 0.05, transparent: true, opacity: 0.7 });
    const motes = new THREE.Points(moteGeo, moteMat);
    roomGroup.add(motes);

    // ── Glass tunnel ──
    const tunnel = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 24, 32, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.25, roughness: 0.1, side: THREE.DoubleSide })
    );
    tunnel.rotation.x = Math.PI / 2;
    tunnel.position.set(0, -0.4, -12);
    roomGroup.add(tunnel);

    // ── Pickable items ──
    const pickables = [];

    // Gallery displays
    for (let i = 0; i < 3; i++) {
      const artMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.0, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.2, metalness: 0.4, emissive: 0x00aaff, emissiveIntensity: 0.3 })
      );
      artMesh.position.set(-4.8 + i * 1.1, 2.2, -3.7);
      artMesh.castShadow = true;
      roomGroup.add(artMesh);
      pickables.push({ mesh: artMesh, name: `Gallery Art Piece / Ebook Tier ${i + 1}` });
    }

    // Megastore displays
    const gearColors = [0xff00aa, 0xffaa00, 0x00ff66];
    const gearNames = ['Surf & Foil Pro Rig', 'Snow & Wake Carbon Setup', 'Extreme Apparel Bundle'];
    for (let i = 0; i < 3; i++) {
      const gearMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 1.1, 0.2),
        new THREE.MeshStandardMaterial({ color: gearColors[i], roughness: 0.2, metalness: 0.4, emissive: gearColors[i], emissiveIntensity: 0.3 })
      );
      gearMesh.position.set(2.6 + i * 1.1, 2.2, -3.7);
      gearMesh.castShadow = true;
      roomGroup.add(gearMesh);
      pickables.push({ mesh: gearMesh, name: gearNames[i] });
    }

    // ── Outlet kiosks (clickable → outlet pages) ──
    function makeOutlet(x, z, title, sub, accent, url) {
      const g = new THREE.Group();
      const ped = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 1.1, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x101a22, roughness: 0.5, emissive: accent, emissiveIntensity: 0.15 })
      );
      ped.position.y = 0.55;
      g.add(ped);
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 0.75),
        new THREE.MeshBasicMaterial({ map: makeTextTexture(title, accent, sub), transparent: true, side: THREE.DoubleSide })
      );
      sign.position.y = 1.7;
      g.add(sign);
      g.position.set(x, 0, z);
      roomGroup.add(g);
      pickables.push({ mesh: sign, name: `Outlet: ${title}`, url, group: g });
      pickables.push({ mesh: ped, name: `Outlet: ${title}`, url, group: g });
      return { group: g, sign };
    }
    makeOutlet(-1.5, -1.2, '🐍 EMERALD', '#001 · Cronulla AUS', '#10b981', 'emerald.html');
    makeOutlet(1.5, -1.2, '🌺 FOAM CO.', '#002 · Maui HI', '#22d3ee', 'foamco.html');

    // ── Super Puff + banner ──
    const superPuff = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff4400, emissiveIntensity: 0.9, roughness: 0.2 })
    );
    superPuff.position.set(0, 3.2, -2);
    scene.add(superPuff);

    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512; bannerCanvas.height = 128;
    const bctx = bannerCanvas.getContext('2d');
    bctx.fillStyle = '#020508'; bctx.fillRect(0, 0, 512, 128);
    bctx.strokeStyle = '#00ffcc'; bctx.lineWidth = 6; bctx.strokeRect(0, 0, 512, 128);
    bctx.shadowColor = '#ff00aa'; bctx.shadowBlur = 18;
    bctx.fillStyle = '#ff00aa';
    bctx.font = 'bold 34px monospace';
    bctx.textAlign = 'center'; bctx.textBaseline = 'middle';
    bctx.fillText('✨ viva la resolution ✨', 256, 64);

    const bannerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 0.55),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bannerCanvas), side: THREE.DoubleSide, transparent: true })
    );
    scene.add(bannerMesh);

    scene.add(roomGroup);

    // ── Interaction ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = pickables.map(it => it.mesh);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const found = pickables.find(it => it.mesh === intersects[0].object);
        if (found) {
          setSelectedItem(found.name);
          if (found.url) setTimeout(() => { window.location.href = found.url; }, 350);
        }
      }
    };
    window.addEventListener('click', handleClick);

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── Animation loop ──
    const clock = new THREE.Clock();
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.05;
      camera.position.y += (1.8 + mouseY * 0.12 - camera.position.y) * 0.05;
      camera.lookAt(0, 1.6, -6);

      // pulsing lights
      interiorGlow.intensity = 2.5 + Math.sin(t * 2.1) * 0.6;
      surfMegaLight.intensity = 2.3 + Math.sin(t * 1.7 + 1) * 0.5;
      galleryLight.intensity = 2.3 + Math.sin(t * 1.9 + 2) * 0.5;

      // bobbing displays
      pickables.forEach((item, index) => {
        if (item.group) return;
        item.mesh.position.y = 2.2 + Math.sin(t * 2 + index) * 0.04;
        item.mesh.rotation.y = Math.sin(t * 0.8 + index) * 0.15;
      });

      // ocean vertex waves
      for (let i = 0; i < oceanPos.count; i++) {
        const ox = oceanBase[i * 3], oy = oceanBase[i * 3 + 1];
        oceanPos.array[i * 3 + 2] =
          Math.sin(ox * 0.25 + t * 1.3) * 0.35 +
          Math.cos(oy * 0.3 + t * 0.9) * 0.28;
      }
      oceanPos.needsUpdate = true;
      oceanGeo.computeVertexNormals();

      // rolling peelers toward shore
      crests.forEach((crest, i) => {
        crest.position.z += 0.045;
        crest.rotation.x += 0.0035;
        const depth = crest.position.z;
        crest.material.opacity = depth > -14 ? Math.max(0, 0.35 - (depth + 14) * 0.05) : 0.35;
        if (depth > -9) crest.position.z = -44 - i * 3;
      });

      // star twinkle + mote drift
      starMat.opacity = 0.65 + Math.sin(t * 1.4) * 0.25;
      motes.rotation.y = t * 0.02;

      // Super Puff flight
      const puffX = Math.sin(t * 0.6) * 4.5;
      const puffY = 3.2 + Math.cos(t * 1.2) * 0.25;
      const puffZ = Math.cos(t * 0.6) * 2 - 4;
      superPuff.position.set(puffX, puffY, puffZ);
      superPuff.rotation.y = t * 2;
      bannerMesh.position.set(puffX - 1.8, puffY, puffZ);
      bannerMesh.quaternion.copy(camera.quaternion);

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
      if (mount && renderer.domElement) mount.removeChild(renderer.domElement);
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

      {/* Header */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', color: '#00ffcc', zIndex: 10, pointerEvents: 'none', textShadow: '0 0 10px rgba(0,255,204,0.5)' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '2px' }}>INFINITY STORE // PORT WAIKATO MEGA-DECK</h1>
        <p style={{ margin: '6px 0 0 0', color: '#ff00aa', fontSize: '1rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,0,170,0.5)' }}>✨ viva la resolution ✨</p>
      </div>

      {/* Inspection toast */}
      {selectedItem && (
        <div style={{ position: 'absolute', bottom: '30px', left: '30px', background: 'rgba(0,255,204,0.1)', border: '1px solid #00ffcc', padding: '15px 25px', borderRadius: '8px', color: '#00ffcc', zIndex: 10, backdropFilter: 'blur(6px)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>⚡ Inspected: {selectedItem}</p>
        </div>
      )}

      {/* HUD */}
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

        <div style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#f5c542' }}>🤝 Rider-Owned Outlets (click the kiosks on deck)</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="emerald.html" style={{ flex: 1, textAlign: 'center', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '8px 4px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold' }}>🐍 Emerald</a>
            <a href="foamco.html" style={{ flex: 1, textAlign: 'center', background: 'rgba(34,211,238,0.15)', border: '1px solid #22d3ee', color: '#22d3ee', padding: '8px 4px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold' }}>🌺 Foam Co.</a>
          </div>
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
