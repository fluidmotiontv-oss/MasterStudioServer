import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { SmartAsset, PhysicsConfig, ColorBucket } from '../types';
import { soundSynth } from '../utils/audioSynth';
import { Volume2, VolumeX, Sparkles, Sliders, Eye, Palette, Zap, Compass, RefreshCw } from 'lucide-react';

interface SmartCanvasProps {
  asset: SmartAsset;
  onUpdatePhysics: (newPhysics: PhysicsConfig) => void;
  colorPalette: ColorBucket[];
  onSelectColor: (color: ColorBucket) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export const SmartCanvas: React.FC<SmartCanvasProps> = ({
  asset,
  onUpdatePhysics,
  colorPalette,
  onSelectColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [isEyedropperActive, setIsEyedropperActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'physics' | 'palette'>('preview');

  // Motion physics springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = {
    stiffness: asset.physics.stiffness,
    damping: asset.physics.damping,
    mass: asset.physics.mass,
  };

  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  const rotateX = useTransform(ySpring, [-0.5, 0.5], [asset.physics.tiltAmount, -asset.physics.tiltAmount]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-asset.physics.tiltAmount, asset.physics.tiltAmount]);

  // Handle cursor move over stage
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);

    // Particle emission on mouse hover
    if (asset.physics.enableParticles && Math.random() < 0.3) {
      spawnParticle(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (asset.physics.enableSound) {
      soundSynth.play(asset.physics.soundType, 0.25);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (asset.physics.enableSound) {
      soundSynth.play(asset.physics.soundType, 0.4);
    }

    // Spawn particle burst
    if (asset.physics.enableParticles) {
      for (let i = 0; i < 16; i++) {
        spawnParticle(clickX, clickY);
      }
    }

    // Eyedropper pixel inspector
    if (isEyedropperActive) {
      inspectPixelColor(e.clientX, e.clientY);
    }
  };

  const spawnParticle = (x: number, y: number) => {
    const newParticle: Particle = {
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 2,
      size: Math.random() * 8 + 4,
      color: asset.physics.particleColor || '#a855f7',
      alpha: 1,
    };
    setParticles((prev) => [...prev.slice(-30), newParticle]);
  };

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: p.alpha - 0.04,
          }))
          .filter((p) => p.alpha > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  const inspectPixelColor = (clientX: number, clientY: number) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = asset.originalUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const hex = colorPalette[0]?.hex || '#a855f7';
        setPickedColor(hex);
        setIsEyedropperActive(false);
      }
    };
  };

  return (
    <div id="smart-canvas-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Primary Playground Stage - Bento Card */}
      <div className="lg:col-span-8 space-y-4">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="relative min-h-[480px] sm:min-h-[540px] rounded-3xl bg-[#121214] border border-zinc-800/80 p-8 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl select-none backdrop-blur-xl"
        >
          {/* Canvas Background Bento Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {/* Interactive Glow Halo */}
          <div
            className="absolute rounded-full transition-all duration-500 pointer-events-none"
            style={{
              width: '320px',
              height: '320px',
              backgroundColor: asset.physics.glowColor,
              filter: `blur(${asset.physics.glowBlur * (isHovered ? 1.5 : 1)}px)`,
              opacity: isHovered ? 0.35 : 0.15,
            }}
          />

          {/* Floating Particles Overlay */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}px`,
                top: `${p.y}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                opacity: p.alpha,
                boxShadow: `0 0 10px ${p.color}`,
              }}
            />
          ))}

          {/* Smart PNG Interactive Element with Motion Physics */}
          <motion.div
            style={{
              rotateX: asset.physics.type === 'tilt3d' ? rotateX : 0,
              rotateY: asset.physics.type === 'tilt3d' ? rotateY : 0,
              perspective: 1000,
            }}
            animate={{
              y: asset.physics.type === 'float' ? [0, -16, 0] : 0,
              rotate: asset.physics.type === 'orbit' ? [0, 360] : 0,
              scale: isHovered ? asset.physics.scaleOnHover : 1,
            }}
            transition={{
              y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
              rotate: { repeat: Infinity, duration: 16, ease: 'linear' },
              scale: { type: 'spring', stiffness: asset.physics.stiffness, damping: asset.physics.damping },
            }}
            className="relative flex items-center justify-center max-w-[320px] max-h-[320px] sm:max-w-[380px] sm:max-h-[380px]"
          >
            {/* Layer 1: Ambient Glow Pass */}
            {asset.layers.find((l) => l.type === 'glow')?.visible !== false && (
              <img
                src={asset.layers.find((l) => l.type === 'glow')?.dataUrl || asset.originalUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-contain filter blur-xl opacity-40 scale-105 pointer-events-none"
              />
            )}

            {/* Layer 2: Dynamic Drop Shadow */}
            {asset.layers.find((l) => l.type === 'shadow')?.visible !== false && (
              <img
                src={asset.layers.find((l) => l.type === 'shadow')?.dataUrl || asset.originalUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-contain filter blur-md brightness-0 opacity-30 translate-y-4 scale-95 pointer-events-none"
              />
            )}

            {/* Layer 3: Main Isolated Subject PNG */}
            <img
              src={asset.layers.find((l) => l.type === 'subject')?.dataUrl || asset.originalUrl}
              alt={asset.name}
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl pointer-events-none"
            />
          </motion.div>

          {/* Floating Canvas Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-xl bg-zinc-900/90 text-zinc-300 border border-zinc-800/80 backdrop-blur-md flex items-center gap-1.5 shadow-md">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Physics: <strong className="text-white capitalize font-sans">{asset.physics.type}</strong>
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => onUpdatePhysics({ ...asset.physics, enableSound: !asset.physics.enableSound })}
              className={`p-2 rounded-xl border text-xs transition-all ${
                asset.physics.enableSound
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                  : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
              }`}
              title="Toggle Web Audio micro-interactions"
            >
              {asset.physics.enableSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Bottom Interactive Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zinc-400 font-medium px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-md flex items-center gap-2 shadow-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Hover to tilt/float, click to emit particles & trigger synth sound</span>
          </div>
        </div>
      </div>

      {/* Physics Controls & Palette Sidebar - Bento Card */}
      <div className="lg:col-span-4 bg-[#121214] rounded-3xl border border-zinc-800/80 p-5 space-y-5 shadow-2xl backdrop-blur-xl">
        {/* Sidebar Nav */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Smart Controls</span>
          </div>
          <div className="flex bg-[#0a0a0b] p-1 rounded-xl border border-zinc-800/80 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mode
            </button>
            <button
              onClick={() => setActiveTab('physics')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === 'physics' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Physics
            </button>
            <button
              onClick={() => setActiveTab('palette')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === 'palette' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Palette
            </button>
          </div>
        </div>

        {/* Tab 1: Physics Mode Selection */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Behavior Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'tilt3d', label: '3D Gyro Tilt', desc: 'Mouse cursor perspective' },
                { id: 'float', label: 'Levitation Float', desc: 'Sine-wave float' },
                { id: 'bounce', label: 'Spring Bounce', desc: 'Interactive spring' },
                { id: 'magnetic', label: 'Cursor Snapping', desc: 'Magnetic pull' },
                { id: 'orbit', label: 'Orbit Spin', desc: '360 rotation' },
                { id: 'particle', label: 'Particle Burst', desc: 'Hover emissions' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() =>
                    onUpdatePhysics({ ...asset.physics, type: mode.id as PhysicsConfig['type'] })
                  }
                  className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                    asset.physics.type === mode.id
                      ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                      : 'bg-[#0a0a0b] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <p className="font-bold">{mode.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>

            {/* Quick Toggles */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Particle Emissions
                </span>
                <input
                  type="checkbox"
                  checked={asset.physics.enableParticles}
                  onChange={(e) => onUpdatePhysics({ ...asset.physics, enableParticles: e.target.checked })}
                  className="rounded bg-[#0a0a0b] border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  Web Audio Synth
                </span>
                <input
                  type="checkbox"
                  checked={asset.physics.enableSound}
                  onChange={(e) => onUpdatePhysics({ ...asset.physics, enableSound: e.target.checked })}
                  className="rounded bg-[#0a0a0b] border-zinc-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Physics Fine-tuning */}
        {activeTab === 'physics' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">Spring Stiffness</span>
                <span className="text-indigo-400 font-mono">{asset.physics.stiffness}</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                value={asset.physics.stiffness}
                onChange={(e) => onUpdatePhysics({ ...asset.physics, stiffness: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">Damping (Friction)</span>
                <span className="text-indigo-400 font-mono">{asset.physics.damping}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={asset.physics.damping}
                onChange={(e) => onUpdatePhysics({ ...asset.physics, damping: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">Hover Scale Multiplier</span>
                <span className="text-indigo-400 font-mono">{asset.physics.scaleOnHover}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="1.4"
                step="0.02"
                value={asset.physics.scaleOnHover}
                onChange={(e) => onUpdatePhysics({ ...asset.physics, scaleOnHover: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">3D Tilt Angle</span>
                <span className="text-indigo-400 font-mono">{asset.physics.tiltAmount}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                value={asset.physics.tiltAmount}
                onChange={(e) => onUpdatePhysics({ ...asset.physics, tiltAmount: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">Sound Preset</label>
              <select
                value={asset.physics.soundType}
                onChange={(e) =>
                  onUpdatePhysics({ ...asset.physics, soundType: e.target.value as PhysicsConfig['soundType'] })
                }
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="chime">Crystal Chime</option>
                <option value="pop">Soft Pop</option>
                <option value="click">Mechanical Click</option>
                <option value="laser">Sci-Fi Laser</option>
                <option value="hum">Quantum Hum</option>
                <option value="crystal">Glass Resonance</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 3: Color Palette & Eyedropper */}
        {activeTab === 'palette' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Extracted Palette</span>
              <button
                onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                  isEyedropperActive
                    ? 'bg-pink-950/60 border-pink-500 text-pink-300'
                    : 'bg-[#0a0a0b] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{isEyedropperActive ? 'Click Canvas Pixel' : 'Inspect Color'}</span>
              </button>
            </div>

            {pickedColor && (
              <div className="p-3 rounded-2xl bg-[#0a0a0b] border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Inspected Color:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: pickedColor }} />
                  <span className="font-mono text-white font-bold">{pickedColor}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {colorPalette.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectColor(color)}
                  className="w-full p-3 rounded-2xl bg-[#0a0a0b] border border-zinc-800 hover:border-indigo-500/50 flex items-center justify-between text-xs transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-xl border border-white/10 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="font-bold text-white">{color.name}</p>
                      <p className="font-mono text-[10px] text-zinc-400">{color.hex}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    {color.percentage}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
