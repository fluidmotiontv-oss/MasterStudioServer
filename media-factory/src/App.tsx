/**
 * Dragon 9 Local Media Machine - Primary Application Entry
 * Integrates Nutflox Cartoon Pipeline, Horizon Engine MIDI, and FluidMotion Companion.
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MasterClockBar } from './components/MasterClockBar';
import { FluidMotionHUD } from './components/FluidMotionHUD';
import { NutfloxStudio } from './components/NutfloxStudio';
import { HorizonMidiLab } from './components/HorizonMidiLab';
import { RenderQueueView } from './components/RenderQueueView';
import { Dragon9Status, RenderJob } from './types';
import { Zap, Film, Music, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'hud' | 'nutflox' | 'midi' | 'queue'>('hud');
  const [status, setStatus] = useState<Dragon9Status | null>(null);
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);

  // Fetch initial system status
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/dragon9/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('Backend status fetch fallback:', err);
    }
  };

  // Fetch render queue
  const fetchRenderQueue = async () => {
    try {
      const res = await fetch('/api/dragon9/render-queue');
      if (res.ok) {
        const data = await res.json();
        setRenderJobs(data.queue || []);
      }
    } catch (err) {
      console.warn('Backend render queue fetch fallback:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchRenderQueue();

    // Poll status periodically
    const timer = setInterval(() => {
      fetchStatus();
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleRunOrchestration = async (params: { show: string; genre: string }) => {
    const res = await fetch('/api/dragon9/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        manifestPreset: params.show,
        genre: params.genre,
        simulateRender: true
      })
    });
    const data = await res.json();
    fetchRenderQueue();
    return data;
  };

  const handleJobCreated = (newJob: RenderJob) => {
    setRenderJobs(prev => [newJob, ...prev]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Dragon 9 Master Clock Bar (54-min hour engine) */}
      <MasterClockBar clock={status?.clock} telemetry={status?.telemetry} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl max-w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hud')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'hud'
                ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>FluidMotion Companion HUD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nutflox')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'nutflox'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Nutflox Cartoon Pipeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('midi')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'midi'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Horizon Engine MIDI (432Hz)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>FFmpeg Render Queue</span>
            {renderJobs.length > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeTab === 'queue' ? 'bg-cyan-800 text-cyan-200' : 'bg-zinc-800 text-cyan-400'
              }`}>
                {renderJobs.length}
              </span>
            )}
          </button>
        </nav>

        {/* View Switcher */}
        {activeTab === 'hud' && (
          <FluidMotionHUD
            status={status}
            onRunOrchestration={handleRunOrchestration}
            onNavigateToTab={(tab: any) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'nutflox' && (
          <NutfloxStudio
            onJobCreated={handleJobCreated}
            onNavigateToQueue={() => setActiveTab('queue')}
          />
        )}

        {activeTab === 'midi' && (
          <HorizonMidiLab />
        )}

        {activeTab === 'queue' && (
          <RenderQueueView
            jobs={renderJobs}
            onRefreshQueue={fetchRenderQueue}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/80 px-4 py-4 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Dragon 9 Machine Architecture • Local Media Factory for the Fluid Motion of the Future
          </div>
          <div className="flex items-center gap-3">
            <span>Verdi 432Hz Core</span>
            <span>•</span>
            <span>54-Minute Metric Time</span>
            <span>•</span>
            <span className="text-emerald-400">All Modules Integrated</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
