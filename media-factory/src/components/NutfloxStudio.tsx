/**
 * Nutflox Cartoon Generation Pipeline Studio
 * Dragon 9 Asset Architect Manifest Parser & Episode Assembly Console.
 *
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Film, Sparkles, Mic, Layers, ArrowRight, Code2, Play, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { AssetArchitectManifest, RenderJob } from '../types';
import { FLAGSHIP_MANIFESTS } from '../data/flagshipManifests';

interface NutfloxStudioProps {
  onJobCreated?: (job: RenderJob) => void;
  onNavigateToQueue?: () => void;
}

export const NutfloxStudio: React.FC<NutfloxStudioProps> = ({ onJobCreated, onNavigateToQueue }) => {
  const [selectedPreset, setSelectedPreset] = useState<'superPuff' | 'peeDubSurfChronicles' | 'custom'>('superPuff');
  const [activeManifest, setActiveManifest] = useState<AssetArchitectManifest>(FLAGSHIP_MANIFESTS.superPuff as any);
  const [customJsonText, setCustomJsonText] = useState(JSON.stringify(FLAGSHIP_MANIFESTS.superPuff, null, 2));
  const [isAssembling, setIsAssembling] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastAssembledJob, setLastAssembledJob] = useState<RenderJob | null>(null);
  const [activeSceneTab, setActiveSceneTab] = useState<number>(0);

  const handleSelectPreset = (preset: 'superPuff' | 'peeDubSurfChronicles' | 'custom') => {
    setSelectedPreset(preset);
    setValidationError(null);
    if (preset === 'superPuff') {
      setActiveManifest(FLAGSHIP_MANIFESTS.superPuff as any);
      setCustomJsonText(JSON.stringify(FLAGSHIP_MANIFESTS.superPuff, null, 2));
    } else if (preset === 'peeDubSurfChronicles') {
      setActiveManifest(FLAGSHIP_MANIFESTS.peeDubSurfChronicles as any);
      setCustomJsonText(JSON.stringify(FLAGSHIP_MANIFESTS.peeDubSurfChronicles, null, 2));
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCustomJsonText(val);
    try {
      const parsed = JSON.parse(val);
      setActiveManifest(parsed);
      setValidationError(null);
    } catch (err: any) {
      setValidationError(`Invalid JSON syntax: ${err.message}`);
    }
  };

  const handleAssembleEpisode = async () => {
    setIsAssembling(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/dragon9/cartoons/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manifestKey: selectedPreset === 'custom' ? undefined : selectedPreset,
          customManifest: selectedPreset === 'custom' ? activeManifest : undefined,
          audioStems: {
            midiGenre: selectedPreset === 'peeDubSurfChronicles' ? 'dub-reggae' : 'g-funk'
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to assemble episode');
      }

      setLastAssembledJob(data.job);
      if (onJobCreated) {
        onJobCreated(data.job);
      }
    } catch (err: any) {
      setValidationError(err.message);
    } finally {
      setIsAssembling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Preset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Nutflox Cartoon Generation Pipeline</h2>
              <p className="text-xs text-zinc-400">
                Dragon 9 Asset Architect manifest parser, AI visual router & ElevenLabs VO automation
              </p>
            </div>
          </div>
        </div>

        {/* Flagship Show Preset Selectors */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 border border-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => handleSelectPreset('superPuff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedPreset === 'superPuff'
                ? 'bg-pink-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Super Puff (Ep 101)
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('peeDubSurfChronicles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedPreset === 'peeDubSurfChronicles'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pee Dub Surf Chronicles (Ep 204)
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              selectedPreset === 'custom'
                ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw JSON Manifest</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Assembly View */}
      {selectedPreset === 'custom' ? (
        /* Raw JSON Editor */
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Dragon 9 Asset Architect JSON Manifest Editor</span>
            </div>
            <span className="text-xs font-mono text-zinc-400">Schema v2.9.4 Validated</span>
          </div>
          <textarea
            value={customJsonText}
            onChange={handleJsonChange}
            rows={18}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      ) : (
        /* Visual Episode Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Episode Metadata & Characters */}
          <div className="space-y-6">
            {/* Manifest Overview Card */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-mono uppercase text-zinc-400">Episode Manifest</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeManifest.dragon9Cycle}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{activeManifest.seriesTitle}</h3>
                <p className="text-xs text-zinc-300 font-medium">{activeManifest.episodeTitle}</p>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  Season {activeManifest.season} • Episode {activeManifest.episodeNumber} ({activeManifest.episodeId})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono text-zinc-400 border-t border-zinc-800/80">
                <div className="bg-zinc-950/60 p-2 rounded-lg">
                  <span className="text-zinc-500 block text-[10px]">FORMAT</span>
                  <span className="text-zinc-200">{activeManifest.resolution} @ {activeManifest.fps}fps</span>
                </div>
                <div className="bg-zinc-950/60 p-2 rounded-lg">
                  <span className="text-zinc-500 block text-[10px]">AUDIO TUNING</span>
                  <span className="text-emerald-400 font-medium">432Hz Verdi</span>
                </div>
              </div>
            </div>

            {/* Character Roster & ElevenLabs Voice Allocation */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>ElevenLabs Voiceover Matrix</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">{activeManifest.characters.length} Voices</span>
              </div>

              <div className="space-y-2.5">
                {activeManifest.characters.map((char) => (
                  <div
                    key={char.id}
                    className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-100">{char.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                        ElevenLabs ID: {char.elevenLabsVoiceId.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{char.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                      <span>Stability: {char.voiceSettings.stability}</span>
                      <span>•</span>
                      <span>Similarity: {char.voiceSettings.similarityBoost}</span>
                      <span>•</span>
                      <span>Seed: #{char.visualModelSeed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Scene Breakdown, AI Visuals, VO & FFmpeg Layers */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-400" />
                  <span className="text-sm font-semibold text-zinc-200">
                    Scene Manifests & Automated FFmpeg Stems
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  Total Duration: {activeManifest.scenes.reduce((acc, s) => acc + (s.durationSeconds || 10), 0)}s
                </span>
              </div>

              {/* Scene Tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                {activeManifest.scenes.map((scene, idx) => (
                  <button
                    key={scene.sceneId}
                    type="button"
                    onClick={() => setActiveSceneTab(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeSceneTab === idx
                        ? 'bg-zinc-800 text-pink-400 border border-pink-500/30 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Scene {idx + 1}: {scene.sceneTitle.slice(0, 20)}... ({scene.durationSeconds}s)
                  </button>
                ))}
              </div>

              {/* Active Scene Detailed View */}
              {activeManifest.scenes[activeSceneTab] && (
                <div className="space-y-4 text-xs">
                  {/* Background & Camera Prompts */}
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-pink-400 uppercase">
                        AI Visual Prompt & Environmental Canvas
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {activeManifest.scenes[activeSceneTab].dragon9Timecode}
                      </span>
                    </div>
                    <p className="text-zinc-200 leading-relaxed font-sans">
                      {activeManifest.scenes[activeSceneTab].backgroundPrompt}
                    </p>
                    <div className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-900 font-mono">
                      <span className="text-zinc-500">Camera Vector: </span>
                      {activeManifest.scenes[activeSceneTab].cameraMotion}
                    </div>
                  </div>

                  {/* AI Visual Keyframes */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Keyframe Animation Sequence Prompts ({activeManifest.scenes[activeSceneTab].visualPrompts.length})
                    </span>
                    <div className="space-y-1.5">
                      {activeManifest.scenes[activeSceneTab].visualPrompts.map((vp, i) => (
                        <div key={i} className="p-2.5 bg-zinc-950/80 border border-zinc-800/60 rounded-lg text-zinc-300 font-mono text-[11px]">
                          {vp}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dialogue Lines Routed to ElevenLabs */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                      <Mic className="w-3 h-3 text-amber-400" />
                      ElevenLabs Dialogue & Audio Stems
                    </span>
                    <div className="space-y-1.5">
                      {activeManifest.scenes[activeSceneTab].dialogue.map((dlg, i) => (
                        <div key={i} className="p-2.5 bg-zinc-950/80 border border-zinc-800/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-amber-300 text-[11px] mr-2">[{dlg.speaker}]</span>
                            <span className="text-zinc-200">"{dlg.line}"</span>
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 shrink-0 bg-zinc-900 px-2 py-1 rounded">
                            +{dlg.startOffset}s ({dlg.duration}s) • {dlg.emotion}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Automated FFmpeg Filters */}
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 space-y-1 font-mono text-[11px]">
                    <span className="text-zinc-500 block text-[10px] uppercase">FFmpeg Filtergraph Layering</span>
                    <span className="text-emerald-400 break-all">{activeManifest.scenes[activeSceneTab].ffmpegFilters}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assembly Action Banner */}
      <div className="bg-gradient-to-r from-pink-950/40 via-zinc-900/60 to-emerald-950/40 border border-zinc-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h4 className="font-bold text-white text-sm">Automate Episode Assembly Pipeline</h4>
          </div>
          <p className="text-xs text-zinc-400">
            Parses Asset Architect manifest, routes AI visual prompts & ElevenLabs VO, and pushes jobs into the automated FFmpeg render queue.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleAssembleEpisode}
            disabled={isAssembling}
            className="px-5 py-2.5 rounded-xl font-medium text-xs bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 shadow-lg shadow-pink-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isAssembling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Assembling Manifest...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Assemble to FFmpeg Queue</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification after Assembly */}
      {lastAssembledJob && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white">
                Render Job Enqueued: {lastAssembledJob.id}
              </span>
              <span className="text-emerald-400/90 font-mono text-[11px]">
                {lastAssembledJob.seriesTitle} - {lastAssembledJob.episodeTitle} ({lastAssembledJob.totalFrames} frames @ {lastAssembledJob.fps}fps)
              </span>
            </div>
          </div>
          {onNavigateToQueue && (
            <button
              type="button"
              onClick={onNavigateToQueue}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-semibold hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>View in Render Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
