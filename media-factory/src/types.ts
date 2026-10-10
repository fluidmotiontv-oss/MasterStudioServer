/**
 * Dragon 9 Media Factory Type Definitions
 *
 * @license Apache-2.0
 */

export interface Dragon9Clock {
  timecode: string;
  terrestrialClock: string;
  cycle: number;
  beat: number;
  tick: number;
  cycleProgressPct: number;
  hourProgressPct: number;
  totalCycles: number;
  beatsPerCycle: number;
  subdivisionsPerCycle: number;
  hourDurationMin: number;
}

export interface Dragon9Telemetry {
  neuralAccelerators: string;
  vramPoolAllocatedGB: number;
  vramPoolTotalGB: number;
  ffmpegWorkerThreads: number;
  audioClockDriftMs: number;
  fluidMotionFps: number;
  tuningMasterHz: number;
  uptimeSeconds: number;
}

export interface Dragon9Status {
  name: string;
  version: string;
  clock: Dragon9Clock;
  telemetry: Dragon9Telemetry;
  pipelines: {
    visualRender: any;
    audioSynthesizer: any;
    syncLocked: boolean;
  };
  activeJobsCount: number;
  totalJobsCount: number;
  supportedShows: string[];
  supportedMusicGenres: {
    id: string;
    name: string;
    defaultBpm: number;
  }[];
}

export interface CharacterManifest {
  id: string;
  name: string;
  description: string;
  elevenLabsVoiceId: string;
  voiceSettings: {
    stability: number;
    similarityBoost: number;
    style?: number;
  };
  visualModelSeed: number;
}

export interface DialogueLine {
  characterId: string;
  speaker: string;
  line: string;
  emotion?: string;
  startOffset?: number;
  duration?: number;
  resolvedVoiceId?: string;
}

export interface SceneManifest {
  sceneId: string;
  sceneTitle: string;
  durationSeconds: number;
  dragon9Timecode: string;
  backgroundPrompt: string;
  cameraMotion: string;
  visualPrompts: string[];
  dialogue: DialogueLine[];
  sfx: string[];
  ffmpegFilters: string;
  sceneNumber?: number;
  routedVisualPrompts?: string[];
  routedVoiceovers?: any[];
}

export interface AssetArchitectManifest {
  manifestVersion: string;
  architectId: string;
  seriesTitle: string;
  episodeId: string;
  episodeTitle: string;
  season: number;
  episodeNumber: number;
  dragon9Cycle: string;
  resolution: string;
  fps: number;
  colorSpace: string;
  aspectRatio: string;
  audioTuning: string;
  characters: CharacterManifest[];
  scenes: SceneManifest[];
}

export interface RenderJob {
  id: string;
  seriesTitle: string;
  episodeId: string;
  episodeTitle: string;
  dragon9Cycle: string;
  status: 'QUEUED' | 'RENDERING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  currentFrame: number;
  totalFrames: number;
  totalDurationSeconds: number;
  fps: number;
  resolution: string;
  audioTuning: string;
  scenesCount: number;
  audioStems: {
    proceduralMidiTrack: string;
    voiceoverTrackCount: number;
    sfxTrackCount: number;
  };
  ffmpegScript: string;
  logs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MidiTrackResult {
  genre: string;
  bpm: number;
  bars: number;
  tuning: string;
  dragon9Sequencer: {
    dragon9HourDuration: string;
    bpm: number;
    beatsPerCycle: number;
    cycleDurationSeconds: number;
    metricBarsPerCycle: number;
    timeSignature: string;
    harmonicTuning: string;
    tuningOffsetCents: number;
  };
  binary?: Uint8Array;
  base64?: string;
  noteSummary: any[];
}

export interface TuningTableRow {
  midiNote: number;
  name: string;
  frequency432Hz: number;
  frequency440Hz: number;
  centDeviation: number;
  harmonicRatio: number;
}
