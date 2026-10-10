/**
 * Horizon Engine MIDI Laboratory
 * 432Hz Harmonic Tuning Data, Procedural MIDI Generation (Dub Reggae, Trip-Hop, G-Funk),
 * and Dragon 9 54-minute hour sequencer alignment.
 *
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Music, Play, Square, Download, Activity, Volume2, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { MidiTrackResult, TuningTableRow } from '../types';
import { playProceduralPattern, stopAudioPlayback, play432HzTone } from '../utils/audioSynth';

export const HorizonMidiLab: React.FC = () => {
  const [selectedGenre, setSelectedGenre] = useState<'g-funk' | 'dub-reggae' | 'trip-hop'>('g-funk');
  const [bpm, setBpm] = useState<number>(92);
  const [bars, setBars] = useState<number>(8);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MidiTrackResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activePlayBar, setActivePlayBar] = useState<number>(0);
  const [tuningTable, setTuningTable] = useState<TuningTableRow[]>([]);
  const [showTuningModal, setShowTuningModal] = useState(false);

  // Set default BPM on genre switch
  const handleGenreSelect = (genre: 'g-funk' | 'dub-reggae' | 'trip-hop') => {
    setSelectedGenre(genre);
    if (genre === 'dub-reggae') setBpm(74);
    else if (genre === 'trip-hop') setBpm(86);
    else setBpm(92);
  };

  const handleGenerateMidi = async () => {
    setIsGenerating(true);
    stopAudioPlayback();
    setIsPlayingAudio(false);

    try {
      const res = await fetch('/api/dragon9/midi/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre: selectedGenre, bpm, bars })
      });
      const data = await res.json();
      setCurrentTrack(data);
    } catch (err) {
      console.error('Failed to generate MIDI:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayLiveAudio = () => {
    if (isPlayingAudio) {
      stopAudioPlayback();
      setIsPlayingAudio(false);
      setActivePlayBar(0);
      return;
    }

    setIsPlayingAudio(true);
    playProceduralPattern(selectedGenre, bpm, (bar) => {
      setActivePlayBar(bar);
      if (bar === 0) {
        setIsPlayingAudio(false);
      }
    });
  };

  // Download binary .mid file
  const handleDownloadMidi = () => {
    window.location.href = `/api/dragon9/midi/download/${selectedGenre}?bpm=${bpm}&bars=${bars}`;
  };

  // Fetch tuning reference table
  useEffect(() => {
    fetch('/api/dragon9/tuning/table')
      .then(r => r.json())
      .then(data => {
        if (data.table) setTuningTable(data.table);
      })
      .catch(() => {});

    // Generate initial track
    handleGenerateMidi();

    return () => {
      stopAudioPlayback();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & 432Hz Harmonic Tuning Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Horizon Engine MIDI Framework</h2>
            <p className="text-xs text-zinc-400">
              Procedural MIDI composition, strict 432Hz harmonic tuning & Dragon 9 54-minute hour sequencer alignment
            </p>
          </div>
        </div>

        {/* 432Hz Harmonic Lock Status */}
        <div className="flex items-center gap-3 bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">A4 = 432.0 Hz</span>
          </div>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">-31.77 Cents (Verdi Tuning)</span>
          <button
            type="button"
            onClick={() => setShowTuningModal(!showTuningModal)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1 cursor-pointer"
          >
            {showTuningModal ? 'Close Table' : 'Inspect Frequencies'}
          </button>
        </div>
      </div>

      {/* Optional 432Hz Tuning Frequency Table */}
      {showTuningModal && (
        <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 font-mono">
              <Activity className="w-4 h-4" />
              <span>432Hz Harmonic Frequency Map (Verdi / Scientific Standard)</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">Formula: f = 432 × 2^((n-69)/12)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
            {tuningTable.slice(36, 72).map(row => (
              <div
                key={row.midiNote}
                className="bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-[11px] font-mono flex items-center justify-between"
              >
                <div>
                  <span className="text-zinc-100 font-bold block">{row.name}</span>
                  <span className="text-emerald-400 text-[10px]">{row.frequency432Hz} Hz</span>
                </div>
                <button
                  type="button"
                  onClick={() => play432HzTone(row.midiNote, 0.4, 'sine')}
                  className="p-1 text-zinc-400 hover:text-emerald-400 bg-zinc-800 rounded transition-colors"
                  title="Test 432Hz Tone"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Procedural Genre Selector & Parameter Controls */}
        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase text-zinc-400 border-b border-zinc-800 pb-2">
              Procedural Style Selection
            </h3>

            {/* 3 Supported Genres */}
            <div className="space-y-2.5">
              {/* Dub Reggae */}
              <button
                type="button"
                onClick={() => handleGenreSelect('dub-reggae')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedGenre === 'dub-reggae'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-emerald-400">Dub Reggae</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                    70-82 BPM
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  One-drop drum rhythm (kick/rim on beat 3), heavy sub roots bass, offbeat skank organ, and space echo delay markers.
                </p>
              </button>

              {/* Trip-Hop */}
              <button
                type="button"
                onClick={() => handleGenreSelect('trip-hop')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedGenre === 'trip-hop'
                    ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-indigo-400">Trip-Hop</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                    84-90 BPM
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Swung boom-bap breakbeat, lush Rhodes minor 9th chords, deep acoustic sub bass, and melancholic flute motifs.
                </p>
              </button>

              {/* G-Funk */}
              <button
                type="button"
                onClick={() => handleGenreSelect('g-funk')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedGenre === 'g-funk'
                    ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-amber-400">West Coast G-Funk</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400">
                    90-98 BPM
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  Punchy 808 claps on beats 2 & 4, bouncy analog sawtooth bass riff, and high portamento sine wave whistle lead.
                </p>
              </button>
            </div>

            {/* Tempo & Bars Sliders */}
            <div className="space-y-3 pt-3 border-t border-zinc-800/80">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">TEMPO (BPM)</span>
                  <span className="text-emerald-400 font-semibold">{bpm} BPM</span>
                </div>
                <input
                  type="range"
                  min={65}
                  max={110}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">BARS PER MOVEMENT</span>
                  <span className="text-zinc-200 font-semibold">{bars} Bars</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={16}
                  step={4}
                  value={bars}
                  onChange={(e) => setBars(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleGenerateMidi}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl font-medium text-xs bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Generate 432Hz Procedural MIDI</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePlayLiveAudio}
                  className={`py-2 px-3 rounded-xl font-medium text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Audition</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Audition (432Hz)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadMidi}
                  className="py-2 px-3 rounded-xl font-medium text-xs bg-zinc-900 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .MID</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Dragon 9 Time Signature Sequencer Grid & MIDI Event Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dragon 9 Metric Sequencer Alignment */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Dragon 9 Sequencer Time Alignment</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                54-Minute Hours Engine
              </span>
            </div>

            {/* Metric Math Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">HOUR DURATION</span>
                <span className="text-white font-semibold">54 Minutes</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">3,240 Terrestrial Sec</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">CYCLES PER HOUR</span>
                <span className="text-emerald-400 font-semibold">9 Cycles</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">360 sec / 6 min each</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">BEATS PER CYCLE</span>
                <span className="text-amber-400 font-semibold">9 Beats</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">40 seconds per beat</span>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px]">METRIC SUBDIVISION</span>
                <span className="text-cyan-400 font-semibold">54 Micro-Pulses</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">6.666s harmonic tick</span>
              </div>
            </div>

            {/* Visual 54-Metric Sequencer Bar Step Visualizer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Horizon 54-Pulse Step Grid</span>
                <span className="text-zinc-400">
                  {isPlayingAudio ? `Auditioning Bar ${activePlayBar || 1}/4` : 'Ready for playback'}
                </span>
              </div>
              <div className="grid grid-cols-9 sm:grid-cols-18 gap-1 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                {Array.from({ length: 54 }).map((_, i) => {
                  const isCurrentActive = isPlayingAudio && (Math.floor(i / 13) === activePlayBar - 1);
                  const isAccent = (i % 9 === 0) || (i % 6 === 0);
                  return (
                    <div
                      key={i}
                      className={`h-6 rounded flex items-center justify-center text-[9px] font-mono transition-all ${
                        isCurrentActive
                          ? 'bg-emerald-400 text-zinc-950 font-bold scale-105 shadow-sm shadow-emerald-400'
                          : isAccent
                          ? 'bg-zinc-800 text-zinc-300 font-semibold'
                          : 'bg-zinc-900 text-zinc-400'
                      }`}
                      title={`Step ${i + 1}`}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Structured MIDI Output Manifest */}
          {currentTrack && (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">
                    Generated SMF Type 1 Structured MIDI Stems
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {currentTrack.genre.toUpperCase()} • {currentTrack.bpm} BPM
                </span>
              </div>

              {/* Multi-track arrangement manifest */}
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-zinc-200">Track 0: Conductor & Master Clock</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">MTS 432Hz SysEx + D9 Markers</span>
                </div>

                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-zinc-200">Track 1: Drums & Percussion (Ch 10)</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">
                    {selectedGenre === 'dub-reggae' ? 'One-Drop Kick & Rimshot' : '808 Kick & Claps'}
                  </span>
                </div>

                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-zinc-200">Track 2: Low Sub Bass (Ch 1)</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">432Hz Fundamental Roots Riff</span>
                </div>

                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    <span className="text-zinc-200">Track 3: Harmonic Chords (Ch 2)</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">
                    {selectedGenre === 'trip-hop' ? 'Rhodes Minor 9ths' : 'Offbeat Skanks / Clavinet'}
                  </span>
                </div>

                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-zinc-200">Track 4: Signature Lead / Whistle (Ch 3)</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">Portamento High Glide Whistle</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
