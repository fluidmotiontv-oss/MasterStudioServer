
// --- DRAGON 9 LOCAL LLM INTERCEPTOR ---
// Hijacks global fetch to reroute Gemini API calls directly to local Ollama.
const _originalFetch = global.fetch;
global.fetch = async (url, options) => {
    if (url && url.toString().includes('generativelanguage.googleapis.com')) {
        console.log("\n[D9 Interceptor] Cloud request blocked. Rerouting prompt to local LLM...");
        try {
            let promptText = "Generate prompt";
            if (options && options.body) {
                const body = JSON.parse(options.body);
                if (body.contents && body.contents[0] && body.contents[0].parts) {
                    promptText = body.contents[0].parts.map(p => p.text).join('\n');
                }
            }
            
            // Route to local Ollama instance
            const localRes = await _originalFetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3", 
                    prompt: promptText,
                    stream: false
                })
            });
            
            if (!localRes.ok) throw new Error("Local LLM returned " + localRes.status);
            const localData = await localRes.json();
            
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    candidates: [{
                        content: { parts: [{ text: localData.response }], role: "model" }
                    }]
                })
            };
        } catch (err) {
            console.error("[D9 Interceptor] Local LLM offline. Is Ollama running?", err.message);
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    candidates: [{ content: { parts: [{ text: "Local LLM Offline - Fallback visual prompt generated." }] } }]
                })
            };
        }
    }
    return _originalFetch(url, options);
};
// --------------------------------------

/**
 * Dragon 9 Orchestrator
 * Unified Local Media Factory for the Fluid Motion of the Future.
 * Wires together Nutflox Cartoon Pipeline (cartoon-generator.js)
 * and Horizon Engine MIDI (horizon-midi.js) under the FluidMotion Companion.
 *
 * @license Apache-2.0
 */

import { CartoonGenerator, FLAGSHIP_MANIFESTS } from './cartoon-generator.js';
import { HorizonEngineMidi, generate432HzTuningTable } from './horizon-midi.js';
import { companion } from './fluidmotion-companion.js';

export class Dragon9Orchestrator {
  constructor() {
    this.cartoonGenerator = new CartoonGenerator();
    this.horizonMidi = new HorizonEngineMidi();
    this.companion = companion;
    this.tuningTable = generate432HzTuningTable();
    this.history = [];
  }

  /**
   * Returns unified machine status.
   */
  getSystemStatus() {
    const companionStatus = this.companion.getStatus();
    const queue = this.cartoonGenerator.renderQueue.getQueue();

    return {
      name: 'Dragon 9 Local Media Factory',
      version: '9.4.0-fluid',
      clock: companionStatus.clock,
      telemetry: companionStatus.telemetry,
      pipelines: companionStatus.pipelines,
      activeJobsCount: queue.filter(j => j.status === 'RENDERING' || j.status === 'QUEUED').length,
      totalJobsCount: queue.length,
      supportedShows: ['Super Puff', 'Pee Dub Surf Chronicles', 'Custom Asset Architect Manifests'],
      supportedMusicGenres: [
        { id: 'dub-reggae', name: 'Dub Reggae (One-Drop, 432Hz, Space Echo)', defaultBpm: 74 },
        { id: 'trip-hop', name: 'Trip-Hop (Downtempo Boom-Bap, Rhodes 9ths)', defaultBpm: 86 },
        { id: 'g-funk', name: 'G-Funk (Bouncy Saw Bass, 432Hz Whistle Lead)', defaultBpm: 92 }
      ]
    };
  }

  /**
   * Generates procedural MIDI with 432Hz harmonic tuning and Dragon 9 time alignment.
   */
  generateSoundtrack(genre = 'g-funk', options = {}) {
    const track = this.horizonMidi.generateTrack(genre, options);
    this.companion.setPipelineStatus('audioSynthesizer', {
      genre: track.genre,
      bpm: track.bpm,
      tuning: track.tuning,
      bars: track.bars,
      generatedAt: new Date().toISOString()
    });
    return track;
  }

  /**
   * Parses an Asset Architect JSON manifest.
   */
  parseManifest(manifestInput) {
    return this.cartoonGenerator.parseManifest(manifestInput);
  }

  /**
   * Runs the complete Unified Media Factory Pipeline:
   * 1. Ingests and parses Asset Architect JSON manifest
   * 2. Generates 432Hz procedural soundtrack via Horizon Engine
   * 3. Routes AI visual prompts and ElevenLabs VO assets
   * 4. Calculates fluid motion timeline sync locks
   * 5. Enqueues job into automated FFmpeg render queue
   */
  async runUnifiedPipeline(params = {}) {
    const {
      manifestPreset = 'superPuff',
      customManifest = null,
      genre = null,
      bpm = null,
      simulateRender = true
    } = params;

    // 1. Resolve manifest
    let manifest;
    if (customManifest) {
      manifest = customManifest;
    } else if (manifestPreset === 'peeDubSurfChronicles' || manifestPreset === 'peedub') {
      manifest = FLAGSHIP_MANIFESTS.peeDubSurfChronicles;
    } else {
      manifest = FLAGSHIP_MANIFESTS.superPuff;
    }

    // 2. Determine matching musical genre if not specified
    let selectedGenre = genre;
    if (!selectedGenre) {
      selectedGenre = (manifest.seriesTitle === 'Pee Dub Surf Chronicles') ? 'dub-reggae' : 'g-funk';
    }

    // 3. Generate procedural 432Hz MIDI soundtrack
    const soundtrack = this.generateSoundtrack(selectedGenre, {
      bpm: bpm || (selectedGenre === 'dub-reggae' ? 74 : (selectedGenre === 'trip-hop' ? 86 : 92)),
      bars: Math.max(8, Math.ceil((manifest.scenes?.length || 2) * 4))
    });

    // 4. Assemble cartoon episode and push to FFmpeg queue
    const { job, assemblyManifest } = await this.cartoonGenerator.assembleEpisode(manifest, {
      midiGenre: soundtrack.genre,
      midiBpm: soundtrack.bpm,
      midiBase64: soundtrack.base64
    });

    // 5. Calculate Fluid Motion audio-visual beat sync
    const sceneDurations = assemblyManifest.scenes.map(s => s.durationSeconds);
    const syncMap = this.companion.calculateFluidMotionSync(soundtrack.bpm, sceneDurations);

    // 6. Update companion pipeline status
    this.companion.setPipelineStatus('visualRender', {
      jobId: job.id,
      seriesTitle: job.seriesTitle,
      episodeTitle: job.episodeTitle,
      status: job.status
    });

    const pipelineResult = {
      pipelineId: `D9-PIPELINE-${Date.now()}`,
      job,
      soundtrack: {
        genre: soundtrack.genre,
        bpm: soundtrack.bpm,
        tuning: soundtrack.tuning,
        dragon9Sequencer: soundtrack.dragon9Sequencer,
        base64: soundtrack.base64,
        noteSummarySample: soundtrack.noteSummary.slice(0, 10)
      },
      assemblyManifest,
      fluidMotionSync: syncMap,
      status: 'READY'
    };

    this.history.unshift(pipelineResult);

    // If requested, simulate the render progress automatically
    if (simulateRender) {
      this.cartoonGenerator.renderQueue.simulateRenderProgress(job.id, updatedJob => {
        this.companion.setPipelineStatus('visualRender', {
          jobId: updatedJob.id,
          seriesTitle: updatedJob.seriesTitle,
          episodeTitle: updatedJob.episodeTitle,
          status: updatedJob.status,
          progress: updatedJob.progress
        });
      });
    }

    return pipelineResult;
  }

  getRenderQueue() {
    return this.cartoonGenerator.renderQueue.getQueue();
  }

  getJob(jobId) {
    return this.cartoonGenerator.renderQueue.getJob(jobId);
  }

  cancelJob(jobId) {
    return this.cartoonGenerator.renderQueue.cancelJob(jobId);
  }

  simulateRender(jobId) {
    this.cartoonGenerator.renderQueue.simulateRenderProgress(jobId, updatedJob => {
      this.companion.setPipelineStatus('visualRender', {
        jobId: updatedJob.id,
        progress: updatedJob.progress,
        status: updatedJob.status
      });
    });
    return this.getJob(jobId);
  }
}

// Global orchestrator singleton instance
export const orchestrator = new Dragon9Orchestrator();

// Standalone CLI execution
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('orchestrator.js')) {
  console.log('=== DRAGON 9 UNIFIED MEDIA FACTORY ORCHESTRATOR ===');
  const targetShow = (process.argv && process.argv[2]) || 'superPuff';
  const targetGenre = (process.argv && process.argv[3]) || 'g-funk';
  console.log(`Running unified pipeline for show: ${targetShow} with 432Hz genre: ${targetGenre}...`);

  orchestrator.runUnifiedPipeline({
    manifestPreset: targetShow,
    genre: targetGenre,
    simulateRender: false
  }).then(result => {
    console.log(`\nPipeline executed successfully!`);
    console.log(`- Job ID: ${result.job.id}`);
    console.log(`- Show: ${result.job.seriesTitle} - ${result.job.episodeTitle}`);
    console.log(`- Soundtrack: ${result.soundtrack.genre} @ ${result.soundtrack.bpm} BPM (${result.soundtrack.tuning})`);
    console.log(`- Dragon 9 Time: ${result.soundtrack.dragon9Sequencer.dragon9HourDuration}`);
    console.log(`- Scenes queued: ${result.assemblyManifest.scenes.length}`);
    console.log(`- Fluid Motion sync checkpoints:`, result.fluidMotionSync);
  });
}
