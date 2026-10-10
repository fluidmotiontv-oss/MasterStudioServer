/**
 * Automated FFmpeg Render Queue Console
 * Displays local Dragon 9 render queue, active job frame progress,
 * generated multi-layer bash scripts, and rendered outputs.
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layers, Terminal, Copy, Check, Play, XCircle, AlertCircle, RefreshCw, Film, Sparkles, CheckCircle2 } from 'lucide-react';
import { RenderJob } from '../types';

interface RenderQueueViewProps {
  jobs: RenderJob[];
  onRefreshQueue: () => void;
}

export const RenderQueueView: React.FC<RenderQueueViewProps> = ({ jobs, onRefreshQueue }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatingIds, setSimulatingIds] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<RenderJob | null>(jobs[0] || null);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  // Periodic polling for status updates if jobs are rendering
  useEffect(() => {
    const hasRendering = jobs.some(j => j.status === 'RENDERING');
    if (hasRendering) {
      const timer = setInterval(() => {
        onRefreshQueue();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [jobs, onRefreshQueue]);

  const handleCopyScript = (job: RenderJob) => {
    navigator.clipboard.writeText(job.ffmpegScript);
    setCopiedId(job.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSimulateRender = async (jobId: string) => {
    setSimulatingIds(prev => new Set(prev).add(jobId));
    try {
      await fetch(`/api/dragon9/render-queue/${jobId}/simulate`, {
        method: 'POST'
      });
      onRefreshQueue();
    } catch (err) {
      console.error('Failed to trigger simulation:', err);
    } finally {
      setTimeout(() => {
        setSimulatingIds(prev => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      }, 1000);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/dragon9/render-queue/${jobId}/cancel`, {
        method: 'POST'
      });
      onRefreshQueue();
    } catch (err) {
      console.error('Failed to cancel job:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Automated FFmpeg Render Queue</h2>
            <p className="text-xs text-zinc-400">
              Multi-layer fluid motion compositing, 432Hz audio mixdown & local encoder queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshQueue}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 border-dashed rounded-2xl p-12 text-center space-y-3">
          <Film className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">Render Queue Empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Assemble an episode from the Nutflox Cartoon Pipeline Studio to enqueue automated FFmpeg rendering jobs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Job Cards List */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-zinc-400 px-1">
              Active Queue ({jobs.length} Jobs)
            </div>

            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isSimulating = simulatingIds.has(job.id);

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-zinc-900/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {job.dragon9Cycle}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : job.status === 'RENDERING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          : job.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{job.seriesTitle}</h4>
                    <p className="text-xs text-zinc-400">{job.episodeTitle}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span>{job.currentFrame}/{job.totalFrames} Frames</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-500'
                            : 'bg-cyan-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {job.resolution} @ {job.fps}fps
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => handleSimulateRender(job.id)}
                          disabled={isSimulating || job.status === 'RENDERING'}
                          className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Render</span>
                        </button>
                      )}
                      {job.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => handleCancelJob(job.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Cancel Job"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Columns: Selected Job Inspector, FFmpeg Script & Logs */}
          <div className="lg:col-span-2 space-y-6">
            {selectedJob ? (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{selectedJob.seriesTitle}</h3>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {selectedJob.id}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{selectedJob.episodeTitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyScript(selectedJob)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === selectedJob.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Script!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Bash Script</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Technical Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">TOTAL DURATION</span>
                    <span className="text-zinc-200 font-bold">{selectedJob.totalDurationSeconds}s</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">TOTAL FRAMES</span>
                    <span className="text-zinc-200 font-bold">{selectedJob.totalFrames} frames</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">VOICEOVER STEMS</span>
                    <span className="text-amber-400 font-bold">{selectedJob.audioStems.voiceoverTrackCount} Tracks</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-500 block text-[10px]">432Hz AUDIO STEM</span>
                    <span className="text-emerald-400 font-bold">{selectedJob.audioStems.proceduralMidiTrack}</span>
                  </div>
                </div>

                {/* Automated FFmpeg Bash Script Viewer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5 text-cyan-400">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Automated FFmpeg CLI Execution Pipeline</span>
                    </div>
                    <span>H.264 / AAC 320k 48kHz</span>
                  </div>
                  <pre className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-56 leading-relaxed">
                    {selectedJob.ffmpegScript}
                  </pre>
                </div>

                {/* Render Logs */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 block">
                    Execution Logs ({selectedJob.logs.length})
                  </span>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1 max-h-32 overflow-y-auto">
                    {selectedJob.logs.map((log, idx) => (
                      <div key={idx} className="leading-snug">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
