import { SmartAsset } from '../types';

// Helper to create clean high-res canvas SVG data URIs
function createSvgDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export const SAMPLE_ASSETS: SmartAsset[] = [
  {
    id: 'sample-gem',
    name: '3D Prismatic Crystal',
    originalUrl: createSvgDataUrl(`
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="facet1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="100%" stop-color="#3b82f6" />
          </linearGradient>
          <linearGradient id="facet2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#a855f7" />
            <stop offset="100%" stop-color="#7e22ce" />
          </linearGradient>
          <linearGradient id="facet3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f472b6" />
            <stop offset="100%" stop-color="#db2777" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#glow)">
          <polygon points="200,40 310,140 200,360 90,140" fill="url(#facet1)" opacity="0.95" />
          <polygon points="200,40 310,140 200,180" fill="url(#facet2)" />
          <polygon points="200,40 90,140 200,180" fill="#93c5fd" opacity="0.8" />
          <polygon points="90,140 200,360 200,180" fill="url(#facet3)" />
          <polygon points="310,140 200,360 200,180" fill="#c084fc" />
          <line x1="200" y1="40" x2="200" y2="360" stroke="#ffffff" stroke-width="2" opacity="0.4" />
        </g>
      </svg>
    `),
    width: 400,
    height: 400,
    category: '3D Asset',
    physics: {
      type: 'tilt3d',
      stiffness: 180,
      damping: 14,
      mass: 1,
      scaleOnHover: 1.12,
      tiltAmount: 25,
      enableParticles: true,
      particleColor: '#a855f7',
      enableSound: true,
      soundType: 'crystal',
      glowColor: '#8b5cf6',
      glowBlur: 24,
    },
    layers: [],
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'sample-coin',
    name: 'Quantum Game Coin',
    originalUrl: createSvgDataUrl(`
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="50%" stop-color="#eab308" />
            <stop offset="100%" stop-color="#ca8a04" />
          </linearGradient>
          <radialGradient id="coinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
            <stop offset="100%" stop-color="#ca8a04" stop-opacity="0.2" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="160" fill="url(#gold)" stroke="#fef08a" stroke-width="12" />
        <circle cx="200" cy="200" r="125" fill="#854d0e" />
        <circle cx="200" cy="200" r="120" fill="url(#coinGlow)" />
        <path d="M 180 120 L 230 120 C 255 120 255 160 230 160 L 180 160 L 230 240 M 180 160 L 220 160 M 180 120 L 180 280 M 200 100 L 200 300" stroke="#fef08a" stroke-width="16" stroke-linecap="round" fill="none" />
      </svg>
    `),
    width: 400,
    height: 400,
    category: 'Game UI',
    physics: {
      type: 'bounce',
      stiffness: 220,
      damping: 10,
      mass: 0.8,
      scaleOnHover: 1.15,
      tiltAmount: 18,
      enableParticles: true,
      particleColor: '#eab308',
      enableSound: true,
      soundType: 'chime',
      glowColor: '#eab308',
      glowBlur: 28,
    },
    layers: [],
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'sample-skull',
    name: 'Cyberpunk Neon Badge',
    originalUrl: createSvgDataUrl(`
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" />
            <stop offset="50%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#ec4899" />
          </linearGradient>
        </defs>
        <polygon points="200,30 350,110 350,290 200,370 50,290 50,110" fill="#0f172a" stroke="url(#neon)" stroke-width="8" />
        <circle cx="150" cy="180" r="28" fill="#06b6d4" />
        <circle cx="250" cy="180" r="28" fill="#ec4899" />
        <polygon points="200,210 180,240 220,240" fill="#f43f5e" />
        <rect x="150" y="270" width="100" height="30" rx="6" fill="url(#neon)" />
        <line x1="175" y1="270" x2="175" y2="300" stroke="#0f172a" stroke-width="4" />
        <line x1="200" y1="270" x2="200" y2="300" stroke="#0f172a" stroke-width="4" />
        <line x1="225" y1="270" x2="225" y2="300" stroke="#0f172a" stroke-width="4" />
      </svg>
    `),
    width: 400,
    height: 400,
    category: 'Badge/Icon',
    physics: {
      type: 'magnetic',
      stiffness: 150,
      damping: 12,
      mass: 1.2,
      scaleOnHover: 1.1,
      tiltAmount: 20,
      enableParticles: true,
      particleColor: '#06b6d4',
      enableSound: true,
      soundType: 'laser',
      glowColor: '#ec4899',
      glowBlur: 32,
    },
    layers: [],
    createdAt: Date.now() - 10800000,
  },
  {
    id: 'sample-orb',
    name: 'Holographic Spherical Core',
    originalUrl: createSvgDataUrl(`
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="holo" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="25%" stop-color="#67e8f9" />
            <stop offset="60%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="150" fill="url(#holo)" />
        <ellipse cx="200" cy="200" rx="170" ry="40" fill="none" stroke="#67e8f9" stroke-width="4" transform="rotate(-25 200 200)" opacity="0.8" />
        <ellipse cx="200" cy="200" rx="170" ry="40" fill="none" stroke="#ec4899" stroke-width="4" transform="rotate(35 200 200)" opacity="0.8" />
      </svg>
    `),
    width: 400,
    height: 400,
    category: 'Mascot/Element',
    physics: {
      type: 'orbit',
      stiffness: 100,
      damping: 18,
      mass: 1.5,
      scaleOnHover: 1.2,
      tiltAmount: 30,
      enableParticles: true,
      particleColor: '#3b82f6',
      enableSound: true,
      soundType: 'hum',
      glowColor: '#3b82f6',
      glowBlur: 30,
    },
    layers: [],
    createdAt: Date.now() - 14400000,
  }
];
