/**
 * Dragon 9 Local Machine Backend Server
 * Connects Nutflox Cartoon Pipeline, Horizon Engine MIDI Framework,
 * FluidMotion Companion, and Express REST APIs with Vite integration.
 *
 * @license Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { orchestrator } from './orchestrator.js';
import { FLAGSHIP_MANIFESTS } from './cartoon-generator.js';
import { generate432HzTuningTable } from './horizon-midi.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ==========================================
  // API Routes
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      machine: 'dragon9',
      timestamp: new Date().toISOString()
    });
  });

  // System & Telemetry status
  app.get('/api/dragon9/status', (req, res) => {
    try {
      const status = orchestrator.getSystemStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Pre-packaged manifests from Dragon 9 Asset Architect
  app.get('/api/dragon9/manifests', (req, res) => {
    res.json({
      presets: [
        {
          key: 'superPuff',
          name: 'Super Puff - Episode 101',
          episodeTitle: 'The Cosmic Marshmallow Nebula',
          genreRecommendation: 'g-funk',
          cycle: 'CYCLE-03:BEAT-07',
          manifest: FLAGSHIP_MANIFESTS.superPuff
        },
        {
          key: 'peeDubSurfChronicles',
          name: 'Pee Dub Surf Chronicles - Episode 204',
          episodeTitle: 'Point Break at Tidal Nine',
          genreRecommendation: 'dub-reggae',
          cycle: 'CYCLE-06:BEAT-02',
          manifest: FLAGSHIP_MANIFESTS.peeDubSurfChronicles
        }
      ]
    });
  });

  // Validate & parse manifest
  app.post('/api/dragon9/manifests/validate', (req, res) => {
    try {
      const { manifest } = req.body;
      if (!manifest) {
        return res.status(400).json({ error: 'Missing manifest payload' });
      }
      const parsed = orchestrator.parseManifest(manifest);
      res.json({ valid: true, parsed });
    } catch (err: any) {
      res.status(400).json({ valid: false, error: err.message });
    }
  });

  // Assemble Cartoon Episode into FFmpeg Queue
  app.post('/api/dragon9/cartoons/assemble', async (req, res) => {
    try {
      const { manifestKey, customManifest, audioStems } = req.body;
      let manifest = customManifest;
      if (!manifest && manifestKey) {
        manifest = FLAGSHIP_MANIFESTS[manifestKey as keyof typeof FLAGSHIP_MANIFESTS];
      }
      if (!manifest) {
        manifest = FLAGSHIP_MANIFESTS.superPuff;
      }

      const result = await orchestrator.cartoonGenerator.assembleEpisode(manifest, audioStems || {});
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Render queue list
  app.get('/api/dragon9/render-queue', (req, res) => {
    try {
      const queue = orchestrator.getRenderQueue();
      res.json({ queue });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Simulate or trigger render progress
  app.post('/api/dragon9/render-queue/:jobId/simulate', (req, res) => {
    try {
      const { jobId } = req.params;
      const job = orchestrator.simulateRender(jobId);
      if (!job) {
        return res.status(404).json({ error: `Job ${jobId} not found` });
      }
      res.json({ success: true, job });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cancel render job
  app.post('/api/dragon9/render-queue/:jobId/cancel', (req, res) => {
    try {
      const { jobId } = req.params;
      const job = orchestrator.cancelJob(jobId);
      if (!job) {
        return res.status(404).json({ error: `Job ${jobId} not found` });
      }
      res.json({ success: true, job });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Procedural MIDI Generation (432Hz Harmonic Tuning)
  app.post('/api/dragon9/midi/generate', (req, res) => {
    try {
      const { genre = 'g-funk', bpm, bars } = req.body;
      const track = orchestrator.generateSoundtrack(genre, { bpm, bars });
      res.json({
        genre: track.genre,
        bpm: track.bpm,
        bars: track.bars,
        tuning: track.tuning,
        dragon9Sequencer: track.dragon9Sequencer,
        base64: track.base64,
        noteSummary: track.noteSummary
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Binary MIDI File Download (.mid)
  app.get('/api/dragon9/midi/download/:genre', (req, res) => {
    try {
      const { genre } = req.params;
      const bpm = req.query.bpm ? Number(req.query.bpm) : undefined;
      const bars = req.query.bars ? Number(req.query.bars) : undefined;
      const track = orchestrator.horizonMidi.generateTrack(genre, { bpm, bars });

      res.setHeader('Content-Type', 'audio/midi');
      res.setHeader('Content-Disposition', `attachment; filename="dragon9_${genre}_432hz.mid"`);
      res.send(Buffer.from(track.binary));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 432Hz Harmonic Tuning Reference Table
  app.get('/api/dragon9/tuning/table', (req, res) => {
    try {
      const table = generate432HzTuningTable();
      res.json({
        standard: 'A=432Hz Verdi Universal',
        referenceA4Hz: 432.0,
        centOffset: -31.77,
        table
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Unified Media Factory Orchestration
  app.post('/api/dragon9/orchestrate', async (req, res) => {
    try {
      const { manifestPreset, customManifest, genre, bpm, simulateRender = true } = req.body;
      const result = await orchestrator.runUnifiedPipeline({
        manifestPreset,
        customManifest,
        genre,
        bpm,
        simulateRender
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // Vite Frontend Middleware
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DRAGON 9 LOCAL MEDIA FACTORY] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
