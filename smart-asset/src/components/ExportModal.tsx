import React, { useState } from 'react';
import { SmartAsset } from '../types';
import { Download, X, Copy, Check, Code2, FileCode, Layers, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: SmartAsset;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, asset }) => {
  const [activeFormat, setActiveFormat] = useState<'react' | 'html' | 'webcomponent' | 'json'>('react');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // React Framer Motion Snippet Generator
  const reactCode = `import React from 'react';
import { motion } from 'framer-motion';

export const ${asset.name.replace(/[^a-zA-Z0-9]/g, '') || 'SmartAsset'}: React.FC = () => {
  return (
    <motion.div
      whileHover={{ scale: ${asset.physics.scaleOnHover} }}
      animate={{
        y: ${asset.physics.type === 'float' ? '[0, -16, 0]' : '0'},
        rotate: ${asset.physics.type === 'orbit' ? '[0, 360]' : '0'}
      }}
      transition={{
        y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
        rotate: { repeat: Infinity, duration: 16, ease: 'linear' },
        scale: { type: 'spring', stiffness: ${asset.physics.stiffness}, damping: ${asset.physics.damping} }
      }}
      className="relative flex items-center justify-center cursor-pointer"
      style={{
        filter: 'drop-shadow(0 20px 30px ${asset.physics.glowColor}40)'
      }}
    >
      <img
        src="${asset.originalUrl}"
        alt="${asset.name}"
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
};`;

  // HTML + CSS Keyframe Snippet Generator
  const htmlCssCode = `<div class="smart-asset-container">
  <img src="${asset.originalUrl}" alt="${asset.name}" class="smart-asset-img" />
</div>

<style>
.smart-asset-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 15px 25px ${asset.physics.glowColor}50);
}

.smart-asset-container:hover {
  transform: scale(${asset.physics.scaleOnHover});
}

.smart-asset-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: floatLevitate 3s ease-in-out infinite;
}

@keyframes floatLevitate {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-16px); }
}
</style>`;

  // Web Component Snippet Generator
  const webComponentCode = `class SmartAssetComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = \`
      <style>
        :host { display: inline-block; }
        img {
          width: 100%;
          height: auto;
          transition: transform 0.3s ease;
          filter: drop-shadow(0 10px 20px ${asset.physics.glowColor});
        }
        img:hover { transform: scale(${asset.physics.scaleOnHover}); }
      </style>
      <img src="${asset.originalUrl}" alt="${asset.name}" />
    \`;
  }
}
customElements.define('smart-asset', SmartAssetComponent);`;

  // JSON Specification
  const jsonCode = JSON.stringify(asset, null, 2);

  const getActiveCode = () => {
    switch (activeFormat) {
      case 'react':
        return reactCode;
      case 'html':
        return htmlCssCode;
      case 'webcomponent':
        return webComponentCode;
      case 'json':
        return jsonCode;
      default:
        return reactCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${asset.name.toLowerCase().replace(/\s+/g, '_')}_smartasset.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121214] border border-zinc-800/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-zinc-100 relative">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export Smart Asset Code</h2>
              <p className="text-xs text-zinc-400">Ready-to-use snippets with physics & styles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="flex bg-[#0a0a0b] p-1.5 rounded-2xl border border-zinc-800 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveFormat('react')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFormat === 'react' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            React + Motion
          </button>
          <button
            onClick={() => setActiveFormat('html')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFormat === 'html' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            HTML + CSS
          </button>
          <button
            onClick={() => setActiveFormat('webcomponent')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFormat === 'webcomponent' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Web Component
          </button>
          <button
            onClick={() => setActiveFormat('json')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeFormat === 'json' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            JSON Spec
          </button>
        </div>

        {/* Code Display Area */}
        <div className="relative">
          <pre className="p-4 rounded-2xl bg-[#0a0a0b] border border-zinc-800/80 font-mono text-xs text-indigo-200 overflow-x-auto max-h-64 scrollbar-thin leading-relaxed">
            {getActiveCode()}
          </pre>

          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-xs font-bold text-zinc-200 border border-zinc-800 flex items-center gap-1.5 shadow-md transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Download Action */}
        <div className="pt-2 flex justify-end gap-3">
          <button
            onClick={handleDownloadJson}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download .smartasset JSON Bundle</span>
          </button>
        </div>
      </div>
    </div>
  );
};
