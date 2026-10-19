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
  x.font = 'bold 40px monospace';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, 256, sub ? 58 : 80);
  if (sub) {
    x.font = 'bold 26px monospace';
    x.fillStyle = '#ffffff';
    x.fillText(sub, 256, 118);
  }
  return new THREE.CanvasTexture(c);
}

// Helper: wave park world map
function makeMapTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#04121e'; x.fillRect(0, 0, 1024, 512);
  x.strokeStyle = 'rgba(0,255,204,0.12)'; x.lineWidth = 1;
  for (let i = 0; i <= 1024; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke(); }
  for (let j = 0; j <= 512; j += 64) { x.beginPath(); x.moveTo(0, j); x.lineTo(1024, j); x.stroke(); }
  x.strokeStyle = '#f5c542'; x.lineWidth = 5; x.strokeRect(2, 2, 1020, 508);
  const spots = [
    ['Urbnsurf · Melbourne', 144.9, -37.8],
    ['Surf Lakes · Yeppoon', 150.7, -23.1],
    ['Shizunami · Japan', 138.8, 34.7],
    ['Alaïa Bay · Swiss', 7.4, 46.3],
    ['O2 Surftown · Munich', 11.6, 48.2],
    ['The Wave · Bristol', -2.6, 51.5],
    ['Surf Ranch · Lemoore', -119.7, 36.3],
    ['BSR Surf Resort · Waco', -97.2, 31.5],
    ['Siam Park · Tenerife', -16.7, 28.1]
  ];
  x.textAlign = 'left';
  spots.forEach(([name, lon, lat]) => {
    const px = (lon + 180) / 360 * 1024, py = (90 - lat) / 180 * 512;
    x.shadowColor = '#f5c542'; x.shadowBlur = 14;
    x.fillStyle = '#f5c542';
    x.beginPath(); x.arc(px, py, 7, 0, Math.PI * 2); x.fill();
    x.shadowBlur = 0;
    x.fillStyle = '#ffffff'; x.font = 'bold 17px monospace';
    x.fillText(name, px + 12, py + 5);
  });
  x.fillStyle = '#00ffcc'; x.font = 'bold 26px monospace'; x.textAlign = 'center';
  x.fillText('WAVE PARK WORLD MAP', 512, 36);
  return new THREE.CanvasTexture(c);
}

// 18 ebook titles across 3 tiers
const EBOOKS = [
  ['Fluid Motion Basics', 'Sunset Beach Sessions', 'Board Care Bible', 'Paddling Power', 'Wipeout Survival', 'The 432Hz Handbook'],
  ['Holo Retail Playbook', 'Grassroots Empire', 'Wave Park Atlas', 'Guides Handbook', 'Bodyboard Shapes 101', 'Shooting the Swell'],
  ['Mega-Deck Masterplan', 'Viva la Resolution', 'Pro Rider Pathway', 'Infinity Store Ops', 'Dragon9 Field Manual', 'Tasman Peelers']
];
const TIER_COLORS = [0x22d3ee, 0xa78bfa, 0xf5c542];

export default function Store3D() {
  const mountRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cartStatus, setCartStatus] = useState('');
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020508);
    scene.fog = new THREE.FogExp2(0x020508, 0.018);

    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 4.0);
    camera.rotation.order = 'YXZ';

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    canvasRef.current = renderer.domElement;

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0x152540, 0.9));

    const sunLight = new THREE.DirectionalLight(0xffaa55, 2.0);
    sunLight.position.set(15, 25, -10);
    scene.add(sunLight);

    const interiorGlow = new THREE.PointLight(0x00ffcc, 2.5, 18);
    interiorGlow.position.set(0, 3.5, 0);
    scene.add(interiorGlow);

    const surfMegaLight = new THREE.PointLight(0xff00aa, 2.3, 15);
    surfMegaLight.position.set(6, 3, -4);
    scene.add(surfMegaLight);

    const galleryLight = new THREE.PointLight(0x00aaff, 2.3, 15);
    galleryLight.position.set(-6, 3, -4);
    scene.add(galleryLight);

    const travelLight = new THREE.PointLight(0xf5c542, 1.8, 7);
    travelLight.position.set(-3, 2.6, -8);
    scene.add(travelLight);

    const techLight = new THREE.PointLight(0xa78bfa, 1.8, 7);
    techLight.position.set(3, 2.6, -8);
    scene.add(techLight);

    const roomGroup = new THREE.Group();

    // ── Timber deck floor ──
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 30),
      new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.7, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -5);
    floor.receiveShadow = true;
    roomGroup.add(floor);

    for (let i = -5; i <= 5; i++) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 30), new THREE.MeshBasicMaterial({ color: 0x1a0f08 }));
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(i * 1.1, 0.005, -5);
      roomGroup.add(strip);
    }
    const stripL = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 26), new THREE.MeshBasicMaterial({ color: 0x00ffcc }));
    stripL.rotation.x = -Math.PI / 2; stripL.position.set(-2.6, 0.01, -6); roomGroup.add(stripL);
    const stripR = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 26), new THREE.MeshBasicMaterial({ color: 0xff00aa }));
    stripR.rotation.x = -Math.PI / 2; stripR.position.set(2.6, 0.01, -6); roomGroup.add(stripR);

    // ── Collision walls (VR walk) ──
    const walls = [];
    const wall = (x1, x2, z1, z2) => walls.push({ x1, x2, z1, z2 });
    function roomWalls(cx, cz) {
      wall(cx - 2.6, cx + 2.6, cz - 3.6, cz - 3.3);      // back
      wall(cx - 2.25, cx - 1.95, cz - 3.6, cz + 3.3);   // left side
      wall(cx + 1.95, cx + 2.25, cz - 3.6, cz + 3.3);   // right side
      wall(cx - 2.6, cx - 0.9, cz + 3.3, cz + 3.6);     // front left
      wall(cx + 0.9, cx + 2.6, cz + 3.3, cz + 3.6);     // front right
    }
    roomWalls(-6, -4); roomWalls(6, -4);
    function boothWalls(cx, cz) {
      wall(cx - 1.5, cx + 1.5, cz - 1.15, cz - 0.85);   // back
      wall(cx - 1.55, cx - 1.25, cz - 1.15, cz + 1.15); // left
      wall(cx + 1.25, cx + 1.55, cz - 1.15, cz + 1.15); // right
      wall(cx - 1.25, cx + 1.25, cz + 0.62, cz + 1.08); // counter
    }
    boothWalls(-3, -8.6); boothWalls(3, -8.6);
    // (outlets moved upstairs — glass elevator has an open walkway entrance)
    const hits = (x, z, r = 0.42) => walls.some(w => x > w.x1 - r && x < w.x2 + r && z > w.z1 - r && z < w.z2 + r);

    // ── Enclosed room builder ──
    function buildRoom(cx, cz, accent) {
      const g = new THREE.Group();
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x0d1620, roughness: 0.65 });
      const back = new THREE.Mesh(new THREE.BoxGeometry(5, 4.5, 0.15), wallMat);
      back.position.set(cx, 2.25, cz - 3.42);
      g.add(back);
      const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.5, 7), wallMat);
      sideL.position.set(cx - 2.08, 2.25, cz);
      g.add(sideL);
      const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.5, 7), wallMat);
      sideR.position.set(cx + 2.08, 2.25, cz);
      g.add(sideR);
      const frontL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.5, 0.15), wallMat);
      frontL.position.set(cx - 1.7, 2.25, cz + 3.42);
      g.add(frontL);
      const frontR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.5, 0.15), wallMat);
      frontR.position.set(cx + 1.7, 2.25, cz + 3.42);
      g.add(frontR);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 0.15), wallMat);
      lintel.position.set(cx, 3.95, cz + 3.42);
      g.add(lintel);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.15, 7.3), wallMat);
      roof.position.set(cx, 4.57, cz);
      g.add(roof);
      const roomFloor = new THREE.Mesh(
        new THREE.BoxGeometry(4.9, 0.05, 6.9),
        new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.75 })
      );
      roomFloor.position.set(cx, 0.03, cz);
      g.add(roomFloor);
      const trimMat = new THREE.MeshBasicMaterial({ color: accent });
      const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.4, 0.06), trimMat);
      trimL.position.set(cx - 0.9, 1.7, cz + 3.5); g.add(trimL);
      const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.4, 0.06), trimMat);
      trimR.position.set(cx + 0.9, 1.7, cz + 3.5); g.add(trimR);
      const trimT = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.06, 0.06), trimMat);
      trimT.position.set(cx, 3.42, cz + 3.5); g.add(trimT);
      roomGroup.add(g);
      return g;
    }
    buildRoom(-6, -4, 0x00aaff);
    buildRoom(6, -4, 0xff00aa);

    // ── Grassroots First banner ──
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 1024; grassCanvas.height = 160;
    {
      const x = grassCanvas.getContext('2d');
      x.fillStyle = 'rgba(2,10,6,0.92)'; x.fillRect(0, 0, 1024, 160);
      x.strokeStyle = '#34d399'; x.lineWidth = 6; x.strokeRect(4, 4, 1016, 152);
      x.shadowColor = '#34d399'; x.shadowBlur = 22;
      x.fillStyle = '#34d399'; x.font = 'bold 46px monospace';
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('🌱 GRASSROOTS FIRST', 512, 58);
      x.shadowBlur = 0;
      x.fillStyle = '#ffffff'; x.font = 'bold 26px monospace';
      x.fillText('support local · free outlets · mates rates · hospitality', 512, 118);
    }
    const grassBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 1.0),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(grassCanvas), transparent: true, side: THREE.DoubleSide })
    );
    grassBanner.position.set(0, 5.15, -5.2);
    roomGroup.add(grassBanner);

    // Neon signs above entrances
    const gallerySign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 1.05),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('◈ STUDIOS + GALLERY', '#00aaff', 'art · ebooks · broadcast'), transparent: true })
    );
    gallerySign.position.set(-6, 5.25, -0.5);
    roomGroup.add(gallerySign);

    const megaSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.9, 1.05),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('MEGASTORE', '#ff00aa', 'sports + clothing'), transparent: true })
    );
    megaSign.position.set(6, 5.25, -0.5);
    roomGroup.add(megaSign);

    // ── Open booth builder ──
    function buildBooth(cx, cz, accent) {
      const g = new THREE.Group();
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x0d1620, roughness: 0.65 });
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.0, 0.12), wallMat);
      back.position.set(0, 1.5, -1.0);
      g.add(back);
      [-1.4, 1.4].forEach(dx => {
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.0, 2.0), wallMat);
        side.position.set(dx, 1.5, 0);
        g.add(side);
      });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 2.2), wallMat);
      roof.position.set(0, 3.05, 0);
      g.add(roof);
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.9, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x1c2a38, roughness: 0.5 })
      );
      counter.position.set(0, 0.45, 0.85);
      g.add(counter);
      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.07, 0.07), new THREE.MeshBasicMaterial({ color: accent }));
      trim.position.set(0, 2.95, 1.1);
      g.add(trim);
      g.position.set(cx, 0, cz);
      roomGroup.add(g);
      return g;
    }

    const pickables = [];

    // ✈️ TRAVEL BOOTH
    buildBooth(-3.0, -8.6, 0xf5c542);
    const mapPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 1.15),
      new THREE.MeshBasicMaterial({ map: makeMapTexture() })
    );
    mapPanel.position.set(-3.0, 1.85, -9.52);
    roomGroup.add(mapPanel);
    pickables.push({ mesh: mapPanel, name: 'Wave Park World Map — 9 pools pinned' });

    const travelSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 0.85),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('✈ TRAVEL', '#f5c542', 'wave-park world tour'), transparent: true, side: THREE.DoubleSide })
    );
    travelSign.position.set(-3.0, 3.75, -8.4);
    roomGroup.add(travelSign);

    [0xf5c542, 0x00ffcc, 0xff00aa].forEach((cc, i) => {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.04, 0.2),
        new THREE.MeshStandardMaterial({ color: cc, emissive: cc, emissiveIntensity: 0.3 })
      );
      b.position.set(-3.5 + i * 0.5, 0.93, -7.75);
      b.rotation.y = i * 0.3;
      roomGroup.add(b);
    });
    const tourDesk = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.06, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x132028, emissive: 0xf5c542, emissiveIntensity: 0.2 })
    );
    tourDesk.position.set(-2.6, 0.94, -7.8);
    roomGroup.add(tourDesk);
    pickables.push({ mesh: tourDesk, name: 'Guided Tours — 4× 3-week tours/yr · pro-rider guides' });

    // 💻 SOFTWARE + TECH BOOTH
    buildBooth(3.0, -8.6, 0xa78bfa);
    const rackGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const unit = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.34, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x131e28, roughness: 0.4, metalness: 0.3 })
      );
      unit.position.set(0, 0.35 + i * 0.38, 0);
      rackGroup.add(unit);
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.03, 0.02),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0x00ffcc : 0xa78bfa })
      );
      led.position.set(0, 0.35 + i * 0.38, 0.31);
      rackGroup.add(led);
    }
    rackGroup.position.set(3.85, 0, -9.2);
    roomGroup.add(rackGroup);
    pickables.push({ mesh: rackGroup.children[0], name: 'Dragon9 Server Rack' });

    const techMon1 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.5),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('DRAGON9', '#a78bfa', '432hz · d9 time') })
    );
    techMon1.position.set(2.55, 1.75, -9.5);
    roomGroup.add(techMon1);
    pickables.push({ mesh: techMon1, name: 'Dragon9 Dashboard' });

    const techMon2 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.5),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('FLOWTOUCH', '#22d3ee', 'holo viewer') })
    );
    techMon2.position.set(3.45, 1.75, -9.5);
    roomGroup.add(techMon2);
    pickables.push({ mesh: techMon2, name: 'FlowTouch Holo Viewer' });

    const techSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 0.85),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('SOFTWARE + TECH', '#a78bfa', 'dragon9 · flowtouch · pwas'), transparent: true, side: THREE.DoubleSide })
    );
    techSign.position.set(3.0, 3.75, -8.4);
    roomGroup.add(techSign);

    // ── Horizon & animated ocean ──
    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 30),
      new THREE.MeshStandardMaterial({ color: 0x040e18, roughness: 0.9, emissive: 0x010306 })
    );
    horizon.position.set(0, 6, -30);
    roomGroup.add(horizon);

    const oceanGeo = new THREE.PlaneGeometry(80, 35, 60, 30);
    const ocean = new THREE.Mesh(oceanGeo, new THREE.MeshStandardMaterial({
      color: 0x004466, roughness: 0.15, metalness: 0.85,
      emissive: 0x002233, emissiveIntensity: 0.4
    }));
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(0, -0.05, -32);
    roomGroup.add(ocean);
    const oceanPos = oceanGeo.attributes.position;
    const oceanBase = oceanPos.array.slice();

    // Rolling peelers down the channel
    const crests = [];
    for (let i = 0; i < 3; i++) {
      const crest = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 9, 32, 1, true, 0, Math.PI * 0.55),
        new THREE.MeshStandardMaterial({
          color: 0x33e0ff, transparent: true, opacity: 0.35,
          emissive: 0x1188aa, emissiveIntensity: 0.6, side: THREE.DoubleSide
        })
      );
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
    roomGroup.add(new THREE.Points(starGeo, starMat));

    // Floating motes
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

    // ── LEFT ROOM: gallery — ebook wall + art on side wall ──
    // 3 shelves × 6 books = 18 ebooks
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.6 });
    for (let s = 0; s < 3; s++) {
      const shelfY = 1.15 + s * 0.75;
      const shelfBoard = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.06, 0.4), shelfMat);
      shelfBoard.position.set(-6, shelfY, -7.2);
      roomGroup.add(shelfBoard);
      for (let b = 0; b < 6; b++) {
        const color = TIER_COLORS[s];
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.13, 0.5, 0.32),
          new THREE.MeshStandardMaterial({ color, roughness: 0.5, emissive: color, emissiveIntensity: 0.28 })
        );
        book.position.set(-7.55 + b * 0.24, shelfY + 0.28, -7.2);
        book.rotation.z = (b % 3 - 1) * 0.03;
        roomGroup.add(book);
        pickables.push({ mesh: book, name: `📚 ${EBOOKS[s][b]} — $3 (tier ${s + 1})` });
      }
    }
    const ebookSign = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.75),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('📚 EBOOKS — $3 each', '#22d3ee', 'tiers 3 · 6 · 9 — all 18 in the $54 bundle'), transparent: true })
    );
    ebookSign.position.set(-6, 3.35, -7.25);
    roomGroup.add(ebookSign);

    // art pieces on left side wall
    for (let i = 0; i < 3; i++) {
      const artMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.0, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x00aaff, roughness: 0.2, metalness: 0.4, emissive: 0x00aaff, emissiveIntensity: 0.35 })
      );
      artMesh.position.set(-8.32, 2.4, -3.6 + i * 1.3);
      artMesh.rotation.y = Math.PI / 2;
      roomGroup.add(artMesh);
      pickables.push({ mesh: artMesh, name: `Gallery Art Piece / Ebook Tier ${i + 1}` });
    }

    // studio corner
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.7), new THREE.MeshStandardMaterial({ color: 0x1c2a38, roughness: 0.5 }));
    desk.position.set(-7.3, 0.92, -5.6);
    roomGroup.add(desk);
    const deskLeg = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.5), new THREE.MeshStandardMaterial({ color: 0x131e28, roughness: 0.6 }));
    deskLeg.position.set(-7.3, 0.45, -5.6);
    roomGroup.add(deskLeg);

    const mon1 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.38),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('FMTV', '#00ffcc', 'live · 432hz') })
    );
    mon1.position.set(-7.62, 1.35, -5.55);
    mon1.rotation.y = 0.25;
    roomGroup.add(mon1);
    pickables.push({ mesh: mon1, name: 'Fluid Motion TV Studio (left wing)' });

    const mon2 = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.38),
      new THREE.MeshBasicMaterial({ map: makeTextTexture('ON AIR', '#ff3355', '● recording') })
    );
    mon2.position.set(-6.95, 1.35, -5.55);
    mon2.rotation.y = -0.25;
    roomGroup.add(mon2);

    const micStand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3), new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.8, roughness: 0.3 }));
    micStand.position.set(-6.5, 0.65, -5.9);
    roomGroup.add(micStand);
    const mic = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xff3355, emissiveIntensity: 0.4 }));
    mic.position.set(-6.5, 1.35, -5.9);
    roomGroup.add(mic);

    // ── RIGHT ROOM: megastore ──
    const surf = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 1.7, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.25, emissive: 0x33e0ff, emissiveIntensity: 0.25 })
    );
    surf.position.set(4.7, 2.3, -7.25);
    surf.rotation.z = 0.12;
    roomGroup.add(surf);
    pickables.push({ mesh: surf, name: 'Surf & Foil Pro Rig' });

    const snow = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.42, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.25, emissive: 0xff00aa, emissiveIntensity: 0.25 })
    );
    snow.position.set(6.3, 2.5, -7.25);
    snow.rotation.z = -0.2;
    roomGroup.add(snow);
    pickables.push({ mesh: snow, name: 'Snow & Wake Carbon Setup' });

    const skate = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.28, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.3, emissive: 0xffaa00, emissiveIntensity: 0.3 })
    );
    skate.position.set(7.6, 1.9, -7.25);
    skate.rotation.z = 0.3;
    roomGroup.add(skate);
    pickables.push({ mesh: skate, name: 'Skate / Street Deck' });

    function makeRack(cx, cz, name) {
      const g = new THREE.Group();
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x8a8a99, metalness: 0.85, roughness: 0.25 });
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 12), poleMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.y = 1.55;
      g.add(bar);
      [-0.85, 0.85].forEach(dx => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.55, 12), poleMat);
        leg.position.set(dx, 0.78, 0);
        g.add(leg);
      });
      const cols = [0xff00aa, 0xffaa00, 0x00ff66, 0x00aaff];
      cols.forEach((c, i) => {
        const shirt = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 0.62, 0.05),
          new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, emissive: c, emissiveIntensity: 0.18 })
        );
        shirt.position.set(-0.63 + i * 0.42, 1.2, 0);
        g.add(shirt);
      });
      g.position.set(cx, 0, cz);
      roomGroup.add(g);
      pickables.push({ mesh: bar, name, group: g });
    }
    makeRack(5.2, -5.2, 'Extreme Apparel Rack — tees + hoodies');
    makeRack(7.0, -4.0, 'Rashies + Boardshorts Rack');

    // ── Mezzanine + glass elevator to the outlets ──
    const mezz = new THREE.Mesh(
      new THREE.BoxGeometry(6.9, 0.15, 6.7),
      new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 0.7 })
    );
    mezz.position.set(0, 3.55, -3.65);
    roomGroup.add(mezz);

    // glowing rails
    const railMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 0.7 });
    const railBack = new THREE.Mesh(new THREE.BoxGeometry(6.9, 0.5, 0.05), railMat);
    railBack.position.set(0, 3.9, -6.95); roomGroup.add(railBack);
    [-3.42, 3.42].forEach(rx => {
      const railSide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 6.6), railMat);
      railSide.position.set(rx, 3.9, -3.65); roomGroup.add(railSide);
    });
    [-2.3, 2.3].forEach(rx => {
      const railFront = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.05), railMat);
      railFront.position.set(rx, 3.9, -0.35); roomGroup.add(railFront);
    });

    // glass elevator shaft (opening faces the walkway, +z)
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.05, 3.9, 32, 1, true, 0.7, Math.PI * 2 - 1.4),
      new THREE.MeshStandardMaterial({ color: 0x9be8ff, transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide })
    );
    shaft.position.set(0, 1.95, -1.0);
    roomGroup.add(shaft);

    const liftPlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.08, 32),
      new THREE.MeshStandardMaterial({ color: 0x132028, emissive: 0x00ffcc, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.3 })
    );
    liftPlatform.position.set(0, 0.15, -1.0);
    roomGroup.add(liftPlatform);
    pickables.push({ mesh: liftPlatform, name: '🛗 Glass Elevator — step inside to ride up to the outlets' });

    function makeOutlet(x, z, title, sub, accent, url, y = 0) {
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
      g.position.set(x, y, z);
      roomGroup.add(g);
      pickables.push({ mesh: sign, name: `Outlet: ${title}`, url, group: g });
      pickables.push({ mesh: ped, name: `Outlet: ${title}`, url, group: g });
    }
    // outlets live upstairs on the mezzanine
    makeOutlet(-2.2, -4.6, '🐍 EMERALD', '#001 · Cronulla AUS', '#10b981', 'emerald.html', 3.63);
    makeOutlet(2.2, -4.6, '🌺 FOAM CO.', '#002 · Maui HI', '#22d3ee', 'foamco.html', 3.63);

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

    // ── VR walk state ──
    const walkPos = { x: 0, z: 4.5 };
    let walkY = 1.7;
    let platY = 0.15;
    let yaw = 0, pitch = 0;
    let locked = false;
    const keys = {};

    // ── Interaction ──
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const tryPick = (cx, cy) => {
      mouse.x = cx; mouse.y = cy;
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

    const handleClick = (e) => {
      if (e.target !== renderer.domElement) return;
      if (locked) {
        tryPick(0, 0); // center of screen
      } else {
        tryPick((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      }
    };
    window.addEventListener('click', handleClick);

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      if (locked) {
        yaw -= e.movementX * 0.0022;
        pitch -= e.movementY * 0.0022;
        pitch = Math.max(-1.2, Math.min(1.2, pitch));
      } else {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleKey = (e, down) => {
      keys[e.code] = down;
      if (down && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    };
    const onKeyDown = (e) => handleKey(e, true);
    const onKeyUp = (e) => handleKey(e, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onLockChange = () => {
      locked = document.pointerLockElement === renderer.domElement;
      setWalking(locked);
    };
    document.addEventListener('pointerlockchange', onLockChange);

    // ── Animation loop ──
    const clock = new THREE.Clock();
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // glass elevator motion
      const liftUp = (Math.sin(t * 0.45) + 1) / 2;
      platY = 0.15 + liftUp * 3.35;
      liftPlatform.position.y = platY;

      if (locked) {
        // VR walk movement
        const speed = (keys['ShiftLeft'] || keys['ShiftRight']) ? 5.2 : 3.0;
        let ix = 0, iz = 0;
        if (keys['KeyW'] || keys['ArrowUp']) iz += 1;
        if (keys['KeyS'] || keys['ArrowDown']) iz -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) ix += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) ix -= 1;
        const len = Math.hypot(ix, iz) || 1;
        ix /= len; iz /= len;
        const sin = Math.sin(yaw), cos = Math.cos(yaw);
        const dx = (-sin * iz + cos * ix) * speed * 0.016;
        const dz = (-cos * iz - sin * ix) * speed * 0.016;
        // elevator ride: step inside the shaft to be carried
        const dElev = Math.hypot(walkPos.x, walkPos.z + 1.0);
        const platEye = platY + 1.7;
        if (dElev < 0.85 && Math.abs(platEye - walkY) < 0.6) {
          walkY = platEye;
        } else if (walkY > 2.5) {
          walkY += (5.33 - walkY) * 0.08; // settle onto mezzanine floor
        }

        const elevated = walkY > 2.5;
        if (elevated) {
          const nx = Math.max(-3.3, Math.min(3.3, walkPos.x + dx));
          const nz = Math.max(-6.85, Math.min(-0.45, walkPos.z + dz));
          const kioskHit = (x, z) =>
            (x > -2.75 && x < -1.65 && z > -5.2 && z < -4.0) ||
            (x > 1.65 && x < 2.75 && z > -5.2 && z < -4.0);
          if (!kioskHit(nx, nz)) { walkPos.x = nx; walkPos.z = nz; }
          else if (!kioskHit(nx, walkPos.z)) { walkPos.x = nx; }
          else if (!kioskHit(walkPos.x, nz)) { walkPos.z = nz; }
        } else {
          const nx = Math.max(-11.2, Math.min(11.2, walkPos.x + dx));
          const nz = Math.max(-9.4, Math.min(9.5, walkPos.z + dz));
          if (!hits(nx, nz)) { walkPos.x = nx; walkPos.z = nz; }
          else if (!hits(nx, walkPos.z)) { walkPos.x = nx; }
          else if (!hits(walkPos.x, nz)) { walkPos.z = nz; }
        }
        camera.position.set(walkPos.x, walkY, walkPos.z);
        camera.rotation.set(pitch, yaw, 0);
      } else {
        camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.05;
        camera.position.y += (1.8 + mouseY * 0.12 - camera.position.y) * 0.05;
        camera.position.z += (4.0 - camera.position.z) * 0.05;
        camera.lookAt(0, 1.6, -6);
      }

      interiorGlow.intensity = 2.5 + Math.sin(t * 2.1) * 0.6;
      surfMegaLight.intensity = 2.3 + Math.sin(t * 1.7 + 1) * 0.5;
      galleryLight.intensity = 2.3 + Math.sin(t * 1.9 + 2) * 0.5;
      travelLight.intensity = 1.8 + Math.sin(t * 1.3 + 0.5) * 0.4;
      techLight.intensity = 1.8 + Math.sin(t * 1.5 + 1.5) * 0.4;

      pickables.forEach((item, index) => {
        if (item.group) return;
        if (item.mesh.position.y > 1.6 && item.mesh.position.y < 3.0) {
          item.mesh.position.y += Math.sin(t * 2 + index) * 0.0008;
          item.mesh.rotation.y += Math.sin(t * 0.8 + index) * 0.0006;
        }
      });

      for (let i = 0; i < oceanPos.count; i++) {
        const ox = oceanBase[i * 3], oy = oceanBase[i * 3 + 1];
        oceanPos.array[i * 3 + 2] =
          Math.sin(ox * 0.25 + t * 1.3) * 0.35 +
          Math.cos(oy * 0.3 + t * 0.9) * 0.28;
      }
      oceanPos.needsUpdate = true;
      oceanGeo.computeVertexNormals();

      crests.forEach((crest, i) => {
        crest.position.z += 0.045;
        crest.rotation.x += 0.0035;
        const depth = crest.position.z;
        crest.material.opacity = depth > -14 ? Math.max(0, 0.35 - (depth + 14) * 0.05) : 0.35;
        if (depth > -9) crest.position.z = -44 - i * 3;
      });

      starMat.opacity = 0.65 + Math.sin(t * 1.4) * 0.25;
      motes.rotation.y = t * 0.02;

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
      renderer.setSize(mount.clientWidth, mount.innerHeight || mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onLockChange);
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

  const enterWalk = () => {
    canvasRef.current?.requestPointerLock();
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#020508', overflow: 'hidden', fontFamily: 'monospace' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', top: '25px', left: '25px', color: '#00ffcc', zIndex: 10, pointerEvents: 'none', textShadow: '0 0 10px rgba(0,255,204,0.5)' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '2px' }}>INFINITY STORE // PORT WAIKATO MEGA-DECK</h1>
        <p style={{ margin: '6px 0 0 0', color: '#ff00aa', fontSize: '1rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,0,170,0.5)' }}>✨ viva la resolution ✨</p>
      </div>

      {/* VR walk button + hint */}
      <div style={{ position: 'absolute', top: '105px', left: '25px', zIndex: 10 }}>
        <button
          onClick={enterWalk}
          style={{ background: walking ? 'rgba(245,197,66,0.2)' : 'rgba(0,255,204,0.12)', border: `1px solid ${walking ? '#f5c542' : '#00ffcc'}`, color: walking ? '#f5c542' : '#00ffcc', padding: '10px 18px', borderRadius: '8px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '1px', boxShadow: '0 0 15px rgba(0,255,204,0.3)' }}
        >
          {walking ? '🚶 WALKING — ESC to exit' : '🚶 ENTER VR WALK'}
        </button>
        {!walking && (
          <p style={{ margin: '8px 0 0 0', color: '#8fa8a0', fontSize: '0.72rem', maxWidth: '220px' }}>WASD / arrows to move · click to inspect · walk through doorways · ride the glass lift to the outlets</p>
        )}
      </div>

      {/* Crosshair when walking */}
      {walking && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#00ffcc', fontSize: '1.6rem', zIndex: 10, pointerEvents: 'none', textShadow: '0 0 8px rgba(0,255,204,0.8)' }}>+</div>
      )}
      {walking && (
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', color: '#8fa8a0', fontSize: '0.78rem', zIndex: 10, pointerEvents: 'none', background: 'rgba(2,5,8,0.6)', padding: '6px 14px', borderRadius: '6px' }}>
          WASD move · click = inspect · Shift = run · 🛗 lift = outlets upstairs · ESC = exit
        </div>
      )}

      {selectedItem && (
        <div style={{ position: 'absolute', bottom: '30px', left: '30px', background: 'rgba(0,255,204,0.1)', border: '1px solid #00ffcc', padding: '15px 25px', borderRadius: '8px', color: '#00ffcc', zIndex: 10, backdropFilter: 'blur(6px)' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>⚡ Inspected: {selectedItem}</p>
        </div>
      )}

      <div style={{ position: 'absolute', top: '25px', right: '25px', background: 'rgba(10, 10, 18, 0.85)', border: '1px solid #00ffcc', padding: '24px', borderRadius: '12px', color: '#ffffff', zIndex: 10, width: '340px', boxShadow: '0 0 30px rgba(0,255,204,0.25)', backdropFilter: 'blur(10px)' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#00ffcc', fontSize: '1.2rem', borderBottom: '1px solid #22223b', paddingBottom: '10px', letterSpacing: '1px' }}>🛍️ Infinity Store Hub</h3>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#ff00aa' }}>$54 Master Bundle Tier</p>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#b8b8d0', lineHeight: '1.4' }}>18 Ebooks ($3 each across 3, 6, 9) + Megastore Gear Access + Stocking Stuffers.</p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#22d3ee' }}>📚 18 Ebooks on the Gallery wall</p>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#b8b8d0', lineHeight: '1.4' }}>$3 each — 3 tiers of 6. Click any book in VR walk to inspect.</p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#00aaff' }}>🎁 Gift & Upgrade Perk</p>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#b8b8d0', lineHeight: '1.4' }}>Every gifted item unlocks a 50% OFF next purchase upgrade token!</p>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#f5c542' }}>✈️ Wave-Park World Tour</p>
          <p style={{ margin: '0', fontSize: '0.82rem', color: '#b8b8d0', lineHeight: '1.4' }}>4 × 3-week guided tours a year. Local-first hospitality — guides trained up from pro riders. 🌱 Grassroots first: local outlets list free, forever.</p>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#f5c542' }}>🤝 Rider-Owned Outlets — upstairs! Ride the 🛗 glass elevator</p>
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
