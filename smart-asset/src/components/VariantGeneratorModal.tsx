import React, { useState } from 'react';
import { ImageGenOptions } from '../types';
import { Wand2, X, Sparkles, RefreshCw, Check, Download, Layers } from 'lucide-react';

interface VariantGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateVariant: (options: ImageGenOptions) => Promise<string | null>;
  onSaveAsActiveAsset: (dataUrl: string, name: string) => void;
}

export const VariantGeneratorModal: React.FC<VariantGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerateVariant,
  onSaveAsActiveAsset,
}) => {
  const [prompt, setPrompt] = useState('3D isometric magic potion flask with glowing ethereal liquid');
  const [style, setStyle] = useState('3D Render');
  const [resolution, setResolution] = useState<'1K' | '2K' | '4K'>('2K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageDataUrl, setGeneratedImageDataUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImageDataUrl(null);
    const result = await onGenerateVariant({
      prompt,
      style,
      resolution,
      aspectRatio: '1:1',
    });
    if (result) {
      setGeneratedImageDataUrl(result);
    }
    setIsGenerating(false);
  };

  const handleUseAsset = () => {
    if (generatedImageDataUrl) {
      onSaveAsActiveAsset(generatedImageDataUrl, `${style} ${prompt.slice(0, 20)}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121214] border border-zinc-800/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-zinc-100 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Asset Variant Generator</h2>
              <p className="text-xs text-zinc-400">Powered by gemini-3-pro-image-preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
            Asset Description / Prompt
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-2xl p-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-pink-500 resize-none"
            placeholder="Describe your target PNG asset..."
          />
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
            Artistic Style Preset
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              '3D Render',
              'Cyberpunk Neon',
              'Glassmorphism',
              '3D Claymation',
              'Minimalist Vector',
              'Gold Metallic',
            ].map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all ${
                  style === s
                    ? 'bg-pink-950/60 border-pink-500/80 text-pink-200'
                    : 'bg-[#0a0a0b] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Options (1K, 2K, 4K) */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
            Output Resolution Affordance
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: '1K', label: '1K (1024x1024)', desc: 'Fast & Standard' },
              { id: '2K', label: '2K (2048x2048)', desc: 'High Detail' },
              { id: '4K', label: '4K (3840x3840)', desc: 'Ultra Studio Quality' },
            ].map((res) => (
              <button
                key={res.id}
                onClick={() => setResolution(res.id as '1K' | '2K' | '4K')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  resolution === res.id
                    ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-[#0a0a0b] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <p className="font-bold text-xs">{res.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{res.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Preview of Generated Variant */}
        {generatedImageDataUrl && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Generated {resolution} Asset Preview
            </label>
            <div className="h-52 rounded-2xl bg-[#0a0a0b] border border-zinc-800 p-4 flex items-center justify-center overflow-hidden">
              <img
                src={generatedImageDataUrl}
                alt="Generated Variant"
                className="max-h-full max-w-full object-contain drop-shadow-xl"
              />
            </div>
            <button
              onClick={handleUseAsset}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Use This Generated Asset</span>
            </button>
          </div>
        )}

        {/* Action Button */}
        {!generatedImageDataUrl && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing High-Res {resolution} Image Variant...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Smart Asset Variant ({resolution})</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
