import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SmartCanvas } from './components/SmartCanvas';
import { LayerStudio } from './components/LayerStudio';
import { AIIntelligencePanel } from './components/AIIntelligencePanel';
import { VariantGeneratorModal } from './components/VariantGeneratorModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { ExportModal } from './components/ExportModal';
import { SAMPLE_ASSETS } from './data/sampleAssets';
import { SmartAsset, PhysicsConfig, ColorBucket, SmartLayer, VectorTraceResult, ImageGenOptions } from './types';
import { extractColorPalette, extractSmartLayers, traceVectorContour } from './utils/imageProcessing';
import { Upload, Plus, Sparkles, HardDrive, Image as ImageIcon, CheckCircle2, Layers } from 'lucide-react';

export default function App() {
  const [assets, setAssets] = useState<SmartAsset[]>(SAMPLE_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(SAMPLE_ASSETS[0].id);
  const [activeTab, setActiveTab] = useState<'canvas' | 'layers' | 'ai'>('canvas');

  // Active asset computed
  const activeAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  // Palette & Layer states
  const [colorPalette, setColorPalette] = useState<ColorBucket[]>([]);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Deep Thinking Mode state
  const [isThinkingLoading, setIsThinkingLoading] = useState(false);
  const [deepThinkingResult, setDeepThinkingResult] = useState<any>(null);

  // Load color palette & smart layers when active asset changes
  useEffect(() => {
    if (!activeAsset) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeAsset.originalUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 400;
      canvas.height = img.naturalHeight || img.height || 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const palette = extractColorPalette(canvas, 5);
        setColorPalette(palette);

        // Populate layers if not already set
        if (activeAsset.layers.length === 0) {
          const extractedLayers = extractSmartLayers(img);
          const vectorTrace = traceVectorContour(img);
          setAssets((prev) =>
            prev.map((a) =>
              a.id === activeAsset.id
                ? { ...a, layers: extractedLayers, vectorTrace, width: canvas.width, height: canvas.height }
                : a
            )
          );
        }
      }
    };
  }, [selectedAssetId]);

  // Handle uploading custom PNG
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      createNewSmartAsset(dataUrl, file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const createNewSmartAsset = (dataUrl: string, name: string) => {
    const newAsset: SmartAsset = {
      id: `asset-${Date.now()}`,
      name,
      originalUrl: dataUrl,
      width: 400,
      height: 400,
      category: 'PNG Asset',
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
        soundType: 'pop',
        glowColor: '#a855f7',
        glowBlur: 24,
      },
      layers: [],
      createdAt: Date.now(),
    };

    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAssetId(newAsset.id);

    // Trigger AI analysis asynchronously
    analyzeAssetWithAI(dataUrl, name, newAsset.id);
  };

  // Call `/api/analyze-asset` (gemini-3.5-flash)
  const analyzeAssetWithAI = async (dataUrl: string, name: string, assetId: string) => {
    try {
      const res = await fetch('/api/analyze-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, imageName: name }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === assetId
              ? {
                  ...a,
                  analysis: json.data,
                  category: json.data.category || a.category,
                  physics: {
                    ...a.physics,
                    type: json.data.suggestedPhysics || a.physics.type,
                  },
                }
              : a
          )
        );
      }
    } catch {
      // AI analysis failover
    }
  };

  // Call `/api/think-deep-analysis` (gemini-3.1-pro-preview with thinkingLevel HIGH)
  const handleTriggerDeepThinking = async (customPrompt?: string) => {
    if (!activeAsset) return;
    setIsThinkingLoading(true);
    try {
      const res = await fetch('/api/think-deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: activeAsset.originalUrl,
          userPrompt: customPrompt || 'Analyze vector structure, layer separation, physics springs, and Framer Motion code',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDeepThinkingResult(json.data);
      }
    } catch {
      // Deep thinking fallback
    } finally {
      setIsThinkingLoading(false);
    }
  };

  // Call `/api/generate-variant` (gemini-3-pro-image-preview in 1K, 2K, 4K)
  const handleGenerateVariant = async (options: ImageGenOptions): Promise<string | null> => {
    try {
      const res = await fetch('/api/generate-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      const json = await res.json();
      if (json.success && json.imageDataUrl) {
        return json.imageDataUrl;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleUpdatePhysics = (newPhysics: PhysicsConfig) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === activeAsset.id ? { ...a, physics: newPhysics } : a))
    );
  };

  const handleUpdateAssetLayers = (layers: SmartLayer[], vectorResult?: VectorTraceResult) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === activeAsset.id
          ? {
              ...a,
              layers,
              ...(vectorResult ? { vectorTrace: vectorResult } : {}),
            }
          : a
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white bg-bento-grid">
      {/* Header Bar */}
      <Header
        appName="Smart Asset Studio"
        activeAssetName={activeAsset?.name}
        driveConnected={!!localStorage.getItem('gdrive_access_token')}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenVariantModal={() => setIsVariantModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenThinkingModal={() => {
          setActiveTab('ai');
          handleTriggerDeepThinking();
        }}
        isThinkingModeActive={!!deepThinkingResult}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Asset Selector Strip - Bento Card */}
        <section className="bg-[#121214] rounded-3xl border border-zinc-800/80 p-5 shadow-2xl backdrop-blur-xl hover:border-zinc-700/80 transition-all duration-300">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              PNG Asset Collection
            </span>

            <label className="cursor-pointer text-xs font-bold px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-2 shadow-md border border-zinc-700/80 transition-all">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upload PNG</span>
              <input type="file" accept="image/png" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Horizontal Asset Carousel */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
            {assets.map((asset) => {
              const isSelected = asset.id === activeAsset?.id;
              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`p-3 rounded-2xl border flex items-center gap-3 shrink-0 transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                      : 'bg-[#0a0a0b] border-zinc-800 hover:border-zinc-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0a0a0b] border border-zinc-800 p-1 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={asset.originalUrl} alt={asset.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="truncate max-w-[120px]">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {asset.name}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 capitalize truncate">{asset.physics.type}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tab 1: Interactive Canvas Stage */}
        {activeTab === 'canvas' && activeAsset && (
          <SmartCanvas
            asset={activeAsset}
            onUpdatePhysics={handleUpdatePhysics}
            colorPalette={colorPalette}
            onSelectColor={(color) =>
              handleUpdatePhysics({ ...activeAsset.physics, glowColor: color.hex, particleColor: color.hex })
            }
          />
        )}

        {/* Tab 2: Cutout & Vector Studio */}
        {activeTab === 'layers' && activeAsset && (
          <LayerStudio asset={activeAsset} onUpdateAssetLayers={handleUpdateAssetLayers} />
        )}

        {/* Tab 3: AI Intelligence Panel (Gemini 3.5 Flash & Gemini 3.1 Pro High Thinking) */}
        {activeTab === 'ai' && activeAsset && (
          <AIIntelligencePanel
            asset={activeAsset}
            onApplyAIPhysics={(suggestedPhysics) =>
              handleUpdatePhysics({ ...activeAsset.physics, type: suggestedPhysics })
            }
            onTriggerDeepThinking={handleTriggerDeepThinking}
            isThinkingLoading={isThinkingLoading}
            deepThinkingResult={deepThinkingResult}
          />
        )}
      </main>

      {/* Modals */}
      <VariantGeneratorModal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        onGenerateVariant={handleGenerateVariant}
        onSaveAsActiveAsset={(dataUrl, name) => createNewSmartAsset(dataUrl, name)}
      />

      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        activeAsset={activeAsset}
        onImportFromDrive={(fileUrl, fileName) => createNewSmartAsset(fileUrl, fileName)}
      />

      {activeAsset && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          asset={activeAsset}
        />
      )}
    </div>
  );
}
