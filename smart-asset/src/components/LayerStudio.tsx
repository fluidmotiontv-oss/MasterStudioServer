import React, { useState } from 'react';
import { SmartAsset, SmartLayer, VectorTraceResult } from '../types';
import { removeBackground, traceVectorContour } from '../utils/imageProcessing';
import { Layers, Scissors, Code2, Copy, Check, Eye, EyeOff, Sparkles, Sliders, RefreshCw } from 'lucide-react';

interface LayerStudioProps {
  asset: SmartAsset;
  onUpdateAssetLayers: (layers: SmartLayer[], vectorResult?: VectorTraceResult) => void;
}

export const LayerStudio: React.FC<LayerStudioProps> = ({ asset, onUpdateAssetLayers }) => {
  const [alphaThreshold, setAlphaThreshold] = useState(25);
  const [chromaKeyHex, setChromaKeyHex] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Vector trace result
  const vectorTrace = asset.vectorTrace || {
    svgContent: `<svg viewBox="0 0 ${asset.width} ${asset.height}" xmlns="http://www.w3.org/2000/svg">
  <path d="M 40 200 Q 200 40 360 200 T 40 200 Z" fill="none" stroke="#a855f7" stroke-width="3" />
</svg>`,
    pathCount: 1,
    viewBox: `0 0 ${asset.width} ${asset.height}`,
    simplifiedPaths: [`M 40 200 Q 200 40 360 200 T 40 200 Z`],
  };

  const handleToggleLayerVisibility = (layerId: string) => {
    const updatedLayers = asset.layers.map((l) =>
      l.id === layerId ? { ...l, visible: !l.visible } : l
    );
    onUpdateAssetLayers(updatedLayers);
  };

  const handleUpdateLayerOpacity = (layerId: string, opacity: number) => {
    const updatedLayers = asset.layers.map((l) =>
      l.id === layerId ? { ...l, opacity } : l
    );
    onUpdateAssetLayers(updatedLayers);
  };

  const handleApplyCutout = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = asset.originalUrl;
    img.onload = () => {
      const cutoutDataUrl = removeBackground(img, alphaThreshold, chromaKeyHex || undefined);
      const updatedLayers = asset.layers.map((l) =>
        l.type === 'subject' ? { ...l, dataUrl: cutoutDataUrl } : l
      );

      const vectorResult = traceVectorContour(img);
      onUpdateAssetLayers(updatedLayers, vectorResult);
      setIsProcessing(false);
    };
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(vectorTrace.svgContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="layer-studio-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Layer Isolation & Preview - Bento Card */}
      <div className="lg:col-span-7 bg-[#121214] rounded-3xl border border-zinc-800/80 p-6 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Smart Layer Isolation</h2>
              <p className="text-xs text-zinc-400">
                Isolate foreground cutout, ambient glow pass, and drop shadow layers
              </p>
            </div>
          </div>
        </div>

        {/* Layer Stack */}
        <div className="space-y-3">
          {asset.layers.map((layer) => (
            <div
              key={layer.id}
              className={`p-4 rounded-2xl border transition-all ${
                layer.visible
                  ? 'bg-[#0a0a0b] border-zinc-800/80'
                  : 'bg-[#0a0a0b]/40 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#121214] border border-zinc-800 p-1 flex items-center justify-center overflow-hidden">
                    <img src={layer.dataUrl} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      {layer.name}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                        Z-{layer.zIndex}
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono text-zinc-400 capitalize">{layer.type} layer</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Opacity slider */}
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={layer.opacity}
                      onChange={(e) => handleUpdateLayerOpacity(layer.id, Number(e.target.value))}
                      className="w-20 accent-indigo-500 bg-zinc-800"
                    />
                  </div>

                  {/* Visibility toggle */}
                  <button
                    onClick={() => handleToggleLayerVisibility(layer.id)}
                    className={`p-2 rounded-xl border text-xs transition-all ${
                      layer.visible
                        ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Background Cutout Controls */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-pink-400" />
              Background Cutout & Transparency Tuning
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Alpha Threshold</span>
                <span className="text-indigo-400 font-mono">{alphaThreshold}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={alphaThreshold}
                onChange={(e) => setAlphaThreshold(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs text-zinc-400 block">Chroma Key Hex Color</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="#000000"
                  value={chromaKeyHex}
                  onChange={(e) => setChromaKeyHex(e.target.value)}
                  className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
                {chromaKeyHex && (
                  <div
                    className="w-8 h-8 rounded-xl border border-white/20 shrink-0"
                    style={{ backgroundColor: chromaKeyHex }}
                  />
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleApplyCutout}
            disabled={isProcessing}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Transparency & Vector Tracing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply Cutout & Re-Trace Vectors</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: SVG Vector Tracing Studio - Bento Card */}
      <div className="lg:col-span-5 bg-[#121214] rounded-3xl border border-zinc-800/80 p-6 space-y-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-pink-950/60 border border-pink-500/30 text-pink-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">SVG Vector Contour Studio</h2>
              <p className="text-xs text-zinc-400">
                Vectorized outline path traced directly from PNG raster bounds
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySvg}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 transition-all"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy SVG'}</span>
          </button>
        </div>

        {/* Vector Preview Box */}
        <div className="relative h-56 rounded-2xl bg-[#0a0a0b] border border-zinc-800/80 p-4 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          <div
            className="w-full h-full text-indigo-400 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: vectorTrace.svgContent }}
          />
        </div>

        {/* Vector Code Box */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
            Generated SVG Markup
          </label>
          <pre className="p-4 rounded-2xl bg-[#0a0a0b] border border-zinc-800/80 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-40 leading-relaxed scrollbar-thin">
            {vectorTrace.svgContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
