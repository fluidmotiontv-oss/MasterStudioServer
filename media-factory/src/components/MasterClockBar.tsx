/**
 * Dragon 9 Master Clock Bar
 * Real-time 54-minute hour timeline and machine telemetry display.
 *
 * @license Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Clock, Cpu, Radio, Zap, ShieldCheck } from 'lucide-react';
import { Dragon9Clock, Dragon9Telemetry } from '../types';

interface MasterClockBarProps {
  clock?: Dragon9Clock;
  telemetry?: Dragon9Telemetry;
}

export const MasterClockBar: React.FC<MasterClockBarProps> = ({ clock: initialClock, telemetry }) => {
  const [clock, setClock] = useState<Dragon9Clock | null>(initialClock || null);

  useEffect(() => {
    // Local fallback clock ticker if API hasn't returned yet
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsedSec = (now / 1000) % (54 * 60);
      const currentCycle = Math.floor(elapsedSec / 360) + 1;
      const cycleElapsed = elapsedSec % 360;
      const currentBeat = Math.floor(cycleElapsed / 40) + 1;
      const currentTick = Math.floor((cycleElapsed / 360) * 54) + 1;

      const pad = (n: number) => String(n).padStart(2, '0');
      setClock({
        timecode: `D9-${pad(currentCycle)}:${pad(currentBeat)}:${pad(currentTick)}`,
        terrestrialClock: new Date().toLocaleTimeString(),
        cycle: currentCycle,
        beat: currentBeat,
        tick: currentTick,
        cycleProgressPct: Math.round((cycleElapsed / 360) * 100),
        hourProgressPct: Math.round((elapsedSec / (54 * 60)) * 100),
        totalCycles: 9,
        beatsPerCycle: 9,
        subdivisionsPerCycle: 54,
        hourDurationMin: 54
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur px-4 py-3 text-zinc-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Machine Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">Dragon 9 Local Media Machine</span>
              <span className="text-[11px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-emerald-500/20">
                v9.4 Online
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Nutflox Pipeline • Horizon Engine MIDI • FluidMotion Companion
            </p>
          </div>
        </div>

        {/* Master Clock & 54-Min Hour Metric */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2">
          {/* Dragon 9 Metric Time */}
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Dragon 9 Master Clock (54m/h)
              </div>
              <div className="font-mono text-sm font-semibold text-emerald-300">
                {clock?.timecode || 'D9-01:01:01'}
              </div>
            </div>
          </div>

          <div className="h-7 w-px bg-zinc-800 hidden sm:block" />

          {/* Cycle & Beat Subdivisions */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div>
              <span className="text-zinc-400">Cycle: </span>
              <span className="text-zinc-100 font-semibold">{clock?.cycle || 1}/9</span>
            </div>
            <div>
              <span className="text-zinc-400">Beat: </span>
              <span className="text-zinc-100 font-semibold">{clock?.beat || 1}/9</span>
            </div>
            <div>
              <span className="text-zinc-400">Tick: </span>
              <span className="text-amber-400 font-semibold">{clock?.tick || 1}/54</span>
            </div>
          </div>

          <div className="h-7 w-px bg-zinc-800 hidden md:block" />

          {/* Tuning & Audio Alignment */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono font-medium text-emerald-300">432Hz Harmonic Lock</span>
          </div>
        </div>

        {/* Hardware Status Indicators */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>4x D9 Tensor Accelerators</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FFmpeg Queue Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
