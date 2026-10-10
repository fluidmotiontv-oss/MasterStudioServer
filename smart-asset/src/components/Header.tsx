import React from 'react';
import { Sparkles, HardDrive, Download, Wand2, Brain, Layers, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  appName: string;
  activeAssetName?: string;
  driveConnected: boolean;
  onOpenDriveModal: () => void;
  onOpenVariantModal: () => void;
  onOpenExportModal: () => void;
  onOpenThinkingModal: () => void;
  isThinkingModeActive: boolean;
  activeTab: 'canvas' | 'layers' | 'ai';
  setActiveTab: (tab: 'canvas' | 'layers' | 'ai') => void;
}

export const Header: React.FC<HeaderProps> = ({
  appName,
  activeAssetName,
  driveConnected,
  onOpenDriveModal,
  onOpenVariantModal,
  onOpenExportModal,
  onOpenThinkingModal,
  isThinkingModeActive,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header id="header-main" className="sticky top-0 z-40 bg-[#121214]/90 backdrop-blur-xl border-b border-zinc-800/80 text-zinc-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Active Asset */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                {appName}
                <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Bento Studio
                </span>
              </h1>
              {activeAssetName && (
                <p className="text-xs text-zinc-400 truncate max-w-[200px] sm:max-w-[280px]">
                  Active Asset: <span className="text-zinc-200 font-medium">{activeAssetName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Drive status badge mobile */}
          <button
            onClick={onOpenDriveModal}
            className="md:hidden text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700"
          >
            <HardDrive className={`w-3.5 h-3.5 ${driveConnected ? 'text-emerald-400' : 'text-zinc-400'}`} />
            <span>Drive</span>
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-[#0a0a0b] p-1 rounded-2xl border border-zinc-800/80">
          <button
            id="btn-tab-canvas"
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'canvas'
                ? 'bg-zinc-800 text-white shadow-md ring-1 ring-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Canvas</span>
          </button>

          <button
            id="btn-tab-layers"
            onClick={() => setActiveTab('layers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'layers'
                ? 'bg-zinc-800 text-white shadow-md ring-1 ring-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            <span>Cutout & Vector</span>
          </button>

          <button
            id="btn-tab-ai"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'ai'
                ? 'bg-zinc-800 text-white shadow-md ring-1 ring-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Intelligence</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* High Thinking Mode Trigger */}
          <button
            id="btn-high-thinking"
            onClick={onOpenThinkingModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isThinkingModeActive
                ? 'bg-purple-950/60 text-purple-200 border-purple-500/50 shadow-md shadow-purple-500/20'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-purple-500/40 hover:text-white'
            }`}
            title="Enable Gemini 3.1 Pro High Thinking Mode for deep architectural asset breakdown"
          >
            <Brain className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
            <span className="hidden sm:inline">High Thinking</span>
          </button>

          {/* AI Image Generation (1K / 2K / 4K) */}
          <button
            id="btn-gen-variant"
            onClick={onOpenVariantModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">AI Variants</span>
          </button>

          {/* Google Drive Integration */}
          <button
            id="btn-drive-integration"
            onClick={onOpenDriveModal}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              driveConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            <HardDrive className={`w-3.5 h-3.5 ${driveConnected ? 'text-emerald-400' : 'text-zinc-400'}`} />
            <span>Google Drive</span>
          </button>

          {/* Code & Asset Export */}
          <button
            id="btn-export-asset"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white shadow-md shadow-indigo-500/20 transition-all ring-1 ring-white/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
