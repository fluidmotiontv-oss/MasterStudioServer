/**
 * FluidMotion Companion HUD
 * Unified Local Media Factory Command Center.
 * Coordinates real-time orchestration between cartoon visual rendering and Horizon MIDI audio.
 *
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Zap, Activity, Radio, RefreshCw, CheckCircle2, ArrowRight, Music, Film, Layers } from 'lucide-react';
import { Dragon9Status, RenderJob } from '../types';

interface FluidMotionHUDProps {
  status: Dragon9Status | null;
  onRunOrchestration: (params: { show: string; genre: string }) => Promise<any>;
  onNavigateToTab: (tab: string) => void;
}

export const FluidMotionHUD: React.FC<FluidMotionHUDProps> = ({ status, onRunOrchestration, onNavigateToTab }) => {
  const [selectedShow, setSelectedShow] = useState<'superPuff' | 'peeDubSurfChronicles'>('superPuff');
  const [selectedGenre, setSelectedGenre] = useState<'g-funk' | 'dub-reggae' | 'trip-hop'>('g-funk');
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<any>(null);

  const handleShowChange = (show: 'superPuff' | 'peeDubSurfChronicles') => {
    setSelectedShow(show);
    // Automatic genre pairing
    if (show === 'peeDubSurfChronicles') {
      setSelectedGenre('dub-reggae');
    } else {
      setSelectedGenre('g-funk');
    }
  };

  const handleExecuteUnifiedPipeline = async () => {
    setIsRunning(true);
    try {
      const result = await onRunOrchestration({
        show: selectedShow,
        genre: selectedGenre
      });
      setLastRunResult(result);
    } catch (err) {
      console.error('Orchestration error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const clock = status?.clock;
  const telemetry = status?.telemetry;

  return (
    <div className="space-y-6">
      {/* Hero Orchestration Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                Fluid Motion Local Media Factory
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Unified Visual & Audio Generation Engine
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Automates the ingestion of Dragon 9 Asset Architect manifests, generates procedural 432Hz harmonic soundtracks, routes ElevenLabs dialogue and AI visuals, and coordinates multi-layer FFmpeg rendering.
            </p>
          </div>

          {/* Quick Launch Panel */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 shrink-0 space-y-3 min-w-[280px]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Select Flagship Show</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleShowChange('superPuff')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedShow === 'superPuff'
                      ? 'bg-pink-600 text-white font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Super Puff
                </button>
                <button
                  type="button"
                  onClick={() => handleShowChange('peeDubSurfChronicles')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedShow === 'peeDubSurfChronicles'
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Pee Dub Surf
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">432Hz Soundtrack Mode</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedGenre('dub-reggae')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    selectedGenre === 'dub-reggae'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Dub Reggae
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGenre('trip-hop')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    selectedGenre === 'trip-hop'
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Trip-Hop
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGenre('g-funk')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                    selectedGenre === 'g-funk'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  G-Funk
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExecuteUnifiedPipeline}
              disabled={isRunning}
              className="w-full py-2.5 rounded-xl font-medium text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Orchestrating Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Run Unified Media Factory</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Execution Result Feedback */}
        {lastRunResult && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold block text-white">
                  Unified Media Factory Run Completed!
                </span>
                <span className="text-emerald-400/90 font-mono text-[11px]">
                  Job {lastRunResult.job.id} enqueued • 432Hz {lastRunResult.soundtrack.genre} soundtrack generated • {lastRunResult.assemblyManifest.scenes.length} scenes synchronized
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('queue')}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Inspect FFmpeg Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Dragon 9 Local Hardware & Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase">Neural Accelerators</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-white font-bold text-sm">4x D9 Tensor Units</div>
          <div className="text-[10px] text-emerald-400">Online & Ready</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase">VRAM Allocation</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-white font-bold text-sm">14.8 / 24.0 GB</div>
          <div className="text-[10px] text-zinc-400">Unified Tensor Pool</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase">Master Audio Tuning</span>
            <Radio className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-emerald-400 font-bold text-sm">432.0 Hz Verdi</div>
          <div className="text-[10px] text-zinc-400">Drift: ±0.12 ms</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] uppercase">54-Min Metric Scale</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-purple-300 font-bold text-sm">0.9x Harmonic Lock</div>
          <div className="text-[10px] text-zinc-400">9 Cycles / 54 Micro-Bars</div>
        </div>
      </div>

      {/* Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nutflox Cartoon Pipeline Card */}
        <div
          onClick={() => onNavigateToTab('nutflox')}
          className="bg-zinc-900/40 border border-zinc-800 hover:border-pink-500/50 rounded-2xl p-5 space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-pink-400 transition-colors">
              Open Studio →
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Nutflox Cartoon Pipeline</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Parses complex Dragon 9 Asset Architect JSON manifests for "Super Puff" and "Pee Dub Surf Chronicles". Handles AI visual prompt routing & ElevenLabs VO.
          </p>
        </div>

        {/* Horizon Engine MIDI Card */}
        <div
          onClick={() => onNavigateToTab('midi')}
          className="bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-5 space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Music className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-emerald-400 transition-colors">
              Open Lab →
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Horizon Engine MIDI</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Procedural MIDI generator with strict 432Hz harmonic tuning for Dub Reggae, Trip-Hop, and G-Funk. Synchronized to Dragon 9 54-minute hour metrics.
          </p>
        </div>

        {/* Automated FFmpeg Render Queue Card */}
        <div
          onClick={() => onNavigateToTab('queue')}
          className="bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-3 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-cyan-400 transition-colors">
              Open Queue →
            </span>
          </div>
          <h3 className="font-bold text-white text-base">FFmpeg Render Queue</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Automated multi-layer compositing queue with fluid motion frame blending (`tblend`), multi-stem audio ducking (`amix`), and live job simulation.
          </p>
        </div>
      </div>
    </div>
  );
};
