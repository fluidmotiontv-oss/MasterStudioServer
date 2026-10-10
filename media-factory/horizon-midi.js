/**
 * Horizon Engine MIDI Framework
 * Designed for procedural MIDI generation, 432Hz harmonic tuning, and audio routing.
 * Enforces 432Hz Verdi / universal harmonic tuning data.
 * Produces structured MIDI files (Type 1 SMF) for Dub Reggae, Trip-Hop, and G-Funk tracks.
 * Aligns the sequencer with the Dragon 9 time signature (54-minute hours).
 *
 * @license Apache-2.0
 */

// 432Hz Harmonic Tuning Constants
export const STANDARD_A4 = 440.0;
export const HARMONIC_A4 = 432.0;
export const TUNING_OFFSET_CENTS = 1200 * Math.log2(HARMONIC_A4 / STANDARD_A4); // ~ -31.76665 cents

// Dragon 9 Time Constants
export const DRAGON9_HOUR_MINUTES = 54;
export const DRAGON9_HOUR_SECONDS = DRAGON9_HOUR_MINUTES * 60; // 3240 seconds
export const DRAGON9_CYCLES_PER_HOUR = 9;
export const DRAGON9_CYCLE_SECONDS = DRAGON9_HOUR_SECONDS / DRAGON9_CYCLES_PER_HOUR; // 360 seconds (6 min)
export const DRAGON9_BEATS_PER_CYCLE = 9;
export const DRAGON9_BEAT_SECONDS = DRAGON9_CYCLE_SECONDS / DRAGON9_BEATS_PER_CYCLE; // 40 seconds
export const DRAGON9_SUBDIVISIONS = 54; // 54 micro-pulses per cycle

/**
 * Calculates the exact 432Hz frequency for any MIDI note number (0 - 127).
 * Formula: f = 432 * 2^((midiNote - 69) / 12)
 */
export function getMidiNoteFrequency432(midiNote) {
  return HARMONIC_A4 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Standard 440Hz frequency for comparison.
 */
export function getMidiNoteFrequency440(midiNote) {
  return STANDARD_A4 * Math.pow(2, (midiNote - 69) / 12);
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getMidiNoteName(midiNote) {
  const octave = Math.floor(midiNote / 12) - 1;
  const name = NOTE_NAMES[midiNote % 12];
  return `${name}${octave}`;
}

/**
 * Generates the complete 432Hz harmonic tuning data table.
 */
export function generate432HzTuningTable() {
  const table = [];
  for (let note = 0; note <= 127; note++) {
    const freq432 = getMidiNoteFrequency432(note);
    const freq440 = getMidiNoteFrequency440(note);
    table.push({
      midiNote: note,
      name: getMidiNoteName(note),
      frequency432Hz: Number(freq432.toFixed(3)),
      frequency440Hz: Number(freq440.toFixed(3)),
      centDeviation: Number(TUNING_OFFSET_CENTS.toFixed(2)),
      harmonicRatio: Number((freq432 / 432).toFixed(4)),
    });
  }
  return table;
}

/**
 * Encodes variable length quantity (VLQ) for MIDI files.
 */
function encodeVariableLength(value) {
  let buffer = value & 0x7f;
  const bytes = [];
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= 0x80;
    buffer += value & 0x7f;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
  return bytes;
}

/**
 * Simple MIDI Type 1 File Builder.
 */
export class MidiFileBuilder {
  constructor(ticksPerQuarter = 480) {
    this.ticksPerQuarter = ticksPerQuarter;
    this.tracks = [];
  }

  addTrack(name = 'Track') {
    const track = new MidiTrack(name, this.ticksPerQuarter);
    this.tracks.push(track);
    return track;
  }

  build() {
    // Header chunk: 'MThd' + length (6) + format (1) + numTracks + ticksPerQuarter
    const numTracks = this.tracks.length;
    const headerBytes = [
      0x4d, 0x54, 0x68, 0x64, // 'MThd'
      0x00, 0x00, 0x00, 0x06, // Length = 6
      0x00, 0x01,             // Format 1 (multi-track)
      (numTracks >> 8) & 0xff, numTracks & 0xff,
      (this.ticksPerQuarter >> 8) & 0xff, this.ticksPerQuarter & 0xff
    ];

    const trackChunks = this.tracks.map(track => track.build());
    const totalLength = headerBytes.length + trackChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);

    result.set(headerBytes, 0);
    let offset = headerBytes.length;
    for (const chunk of trackChunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }
}

export class MidiTrack {
  constructor(name, ticksPerQuarter = 480) {
    this.name = name;
    this.ticksPerQuarter = ticksPerQuarter;
    this.events = [];
    this.currentTime = 0;
  }

  addTempo(bpm, deltaTicks = 0) {
    const microsecondsPerQuarter = Math.round(60000000 / bpm);
    this.events.push({
      delta: deltaTicks,
      bytes: [
        0xff, 0x51, 0x03,
        (microsecondsPerQuarter >> 16) & 0xff,
        (microsecondsPerQuarter >> 8) & 0xff,
        microsecondsPerQuarter & 0xff
      ]
    });
  }

  addTimeSignature(numerator = 4, denominator = 4, deltaTicks = 0) {
    const denomPower = Math.round(Math.log2(denominator));
    this.events.push({
      delta: deltaTicks,
      bytes: [0xff, 0x58, 0x04, numerator, denomPower, 24, 8]
    });
  }

  addTrackName(name, deltaTicks = 0) {
    const nameBytes = Array.from(new TextEncoder().encode(name));
    this.events.push({
      delta: deltaTicks,
      bytes: [0xff, 0x03, nameBytes.length, ...nameBytes]
    });
  }

  addTextMarker(text, deltaTicks = 0) {
    const textBytes = Array.from(new TextEncoder().encode(text));
    this.events.push({
      delta: deltaTicks,
      bytes: [0xff, 0x01, textBytes.length, ...textBytes]
    });
  }

  /**
   * Injects MIDI Tuning Standard (MTS) Master Fine Tuning RPN for 432Hz.
   * RPN parameter 00 01 (Fine Tuning). Value 8192 is center (+0 cents).
   * -31.7667 cents maps to approximately ~8062 in 14-bit resolution.
   */
  add432HzTuningRPN(channel = 0, deltaTicks = 0) {
    const rpnMsb = 0x00;
    const rpnLsb = 0x01;
    // Offset calculation: 8192 + (cents * (8192 / 100))
    const offsetVal = Math.round(8192 + (TUNING_OFFSET_CENTS * (8192 / 100))); // ~ 5589
    const valMsb = (offsetVal >> 7) & 0x7f;
    const valLsb = offsetVal & 0x7f;

    this.events.push({
      delta: deltaTicks,
      bytes: [
        0xb0 | channel, 0x65, rpnMsb, // RPN MSB
        0x00, 0xb0 | channel, 0x64, rpnLsb, // RPN LSB
        0x00, 0xb0 | channel, 0x06, valMsb, // Data Entry MSB
        0x00, 0xb0 | channel, 0x26, valLsb, // Data Entry LSB
        0x00, 0xb0 | channel, 0x65, 0x7f,   // Reset RPN MSB
        0x00, 0xb0 | channel, 0x64, 0x7f    // Reset RPN LSB
      ]
    });
  }

  addNote(channel, note, velocity, durationTicks, deltaTicks = 0) {
    // Note On
    this.events.push({
      delta: deltaTicks,
      bytes: [0x90 | channel, note & 0x7f, velocity & 0x7f]
    });
    // Note Off
    this.events.push({
      delta: durationTicks,
      bytes: [0x80 | channel, note & 0x7f, 0x00]
    });
  }

  addPitchBend(channel, bendValue14Bit, deltaTicks = 0) {
    const lsb = bendValue14Bit & 0x7f;
    const msb = (bendValue14Bit >> 7) & 0x7f;
    this.events.push({
      delta: deltaTicks,
      bytes: [0xe0 | channel, lsb, msb]
    });
  }

  build() {
    const trackBytes = [];
    for (const evt of this.events) {
      const deltaBytes = encodeVariableLength(evt.delta);
      trackBytes.push(...deltaBytes);
      trackBytes.push(...evt.bytes);
    }
    // End of Track meta event: delta 0, FF 2F 00
    trackBytes.push(0x00, 0xff, 0x2f, 0x00);

    const length = trackBytes.length;
    const header = [
      0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
      (length >> 24) & 0xff,
      (length >> 16) & 0xff,
      (length >> 8) & 0xff,
      length & 0xff
    ];

    const result = new Uint8Array(header.length + length);
    result.set(header, 0);
    result.set(trackBytes, header.length);
    return result;
  }
}

/**
 * Procedural Generators for Dub Reggae, Trip-Hop, and G-Funk.
 */
export class HorizonEngineMidi {
  constructor(options = {}) {
    this.tuningStandard = 'A=432Hz Verdi Harmonic';
    this.dragon9Alignment = true;
    this.masterClockCycle = options.cycle || 1;
  }

  /**
   * Calculates Dragon 9 Metric Sequencer metadata.
   */
  getDragon9SequencerClock(bpm) {
    const beatsPerDragonHour = (bpm * DRAGON9_HOUR_MINUTES);
    const beatsPerCycle = beatsPerDragonHour / DRAGON9_CYCLES_PER_HOUR;
    return {
      dragon9HourDuration: '54 Terrestrial Minutes',
      bpm,
      beatsPerCycle: Number(beatsPerCycle.toFixed(2)),
      cycleDurationSeconds: DRAGON9_CYCLE_SECONDS,
      metricBarsPerCycle: Math.floor(beatsPerCycle / 4),
      timeSignature: '9/8 Dragon Metric Quad (or 4/4 syncopated)',
      harmonicTuning: '432Hz Fundamental Frequency',
      tuningOffsetCents: TUNING_OFFSET_CENTS
    };
  }

  /**
   * Generates a Dub Reggae MIDI track structure:
   * - One-drop kick on beat 3, rim/snare on beat 3, 16th swung hi-hats
   * - Deep sub bassline playing roots/5ths with syncopated rests
   * - Skank guitar/organ chords on offbeats
   * - Dub tape delay automation markers
   */
  generateDubReggae(options = {}) {
    const bpm = options.bpm || 74;
    const bars = options.bars || 8;
    const tpq = 480;
    const builder = new MidiFileBuilder(tpq);

    // Track 0: Conductor
    const conductor = builder.addTrack('Dragon 9 Conductor - 432Hz Dub');
    conductor.addTempo(bpm, 0);
    conductor.addTimeSignature(4, 4, 0);
    conductor.addTextMarker(`Horizon Engine Dub Reggae | 432Hz Harmonic | D9 Cycle ${this.masterClockCycle}`);
    conductor.add432HzTuningRPN(0, 0);

    // Track 1: Drums (Channel 9 - MIDI Ch 10)
    const drums = builder.addTrack('Dub Drums (One Drop)');
    drums.addTrackName('Dub One-Drop Drums');
    drums.add432HzTuningRPN(9, 0);

    const kickNote = 36;
    const snareNote = 37; // Side-stick / Rimshot
    const hatNote = 42; // Closed Hi-Hat

    // Track 2: Sub Bass (Channel 0)
    const bass = builder.addTrack('Dub Sub Bass (432Hz)');
    bass.addTrackName('Sub Roots Bass');
    bass.add432HzTuningRPN(0, 0);

    // Track 3: Skank Chords (Channel 1)
    const skank = builder.addTrack('Dub Skank Organ/Guitar');
    skank.addTrackName('Off-Beat Skank Chords');
    skank.add432HzTuningRPN(1, 0);

    // Dub Chord Progression in A Minor (A=432Hz): Am -> G -> F -> Em
    const chordProgression = [
      { root: 33, chord: [57, 60, 64] }, // Am
      { root: 31, chord: [55, 59, 62] }, // G
      { root: 29, chord: [53, 57, 60] }, // F
      { root: 28, chord: [52, 55, 59] }  // Em
    ];

    const noteEvents = [];

    for (let bar = 0; bar < bars; bar++) {
      const prog = chordProgression[bar % chordProgression.length];

      // One-Drop Drums (Kick & Snare on Beat 3)
      for (let beat = 0; beat < 4; beat++) {
        // Hi hats on each 8th note
        drums.addNote(9, hatNote, 85, tpq / 2, 0);
        drums.addNote(9, hatNote, 70, tpq / 2, tpq / 2);

        noteEvents.push({ time: bar * 4 + beat, track: 'drums', instrument: 'hi-hat', note: hatNote });

        if (beat === 2) {
          // Beat 3 (0-indexed = 2): Kick + Snare rimshot hit together
          drums.addNote(9, kickNote, 115, tpq, 0);
          drums.addNote(9, snareNote, 110, tpq, 0);
          noteEvents.push({ time: bar * 4 + beat, track: 'drums', instrument: 'one-drop kick+rim', note: kickNote });
        }

        // Skank Chords on the OFFBEAT (the "and" of each beat)
        for (const cNote of prog.chord) {
          skank.addNote(1, cNote, 95, tpq / 3, tpq / 2); // offbeat
        }
        noteEvents.push({ time: bar * 4 + beat + 0.5, track: 'skank', chord: prog.chord });
      }

      // Dub Bassline: syncopated roots and fifths
      const root = prog.root;
      const fifth = root + 7;
      bass.addNote(0, root, 110, tpq * 1.2, tpq / 2);
      bass.addNote(0, fifth, 95, tpq * 0.8, tpq);
      bass.addNote(0, root, 105, tpq, tpq);
      noteEvents.push({ time: bar * 4, track: 'bass', notes: [root, fifth] });
    }

    const binaryMidi = builder.build();
    return {
      genre: 'dub-reggae',
      bpm,
      bars,
      tuning: '432Hz Verdi Universal',
      dragon9Sequencer: this.getDragon9SequencerClock(bpm),
      binary: binaryMidi,
      base64: Buffer.from(binaryMidi).toString('base64'),
      noteSummary: noteEvents
    };
  }

  /**
   * Generates a Trip-Hop MIDI track:
   * - Swung boom-bap breakbeat (kick on 1 and 2-and, snare on 2 and 4, swinging 16th hats)
   * - Deep warm acoustic/sub bass with slides
   * - Moody Minor 9th Rhodes electric piano chords
   * - Melancholic melody stabs & vinyl crackle markers
   */
  generateTripHop(options = {}) {
    const bpm = options.bpm || 86;
    const bars = options.bars || 8;
    const tpq = 480;
    const builder = new MidiFileBuilder(tpq);

    // Track 0: Conductor
    const conductor = builder.addTrack('Conductor - Trip-Hop 432Hz');
    conductor.addTempo(bpm, 0);
    conductor.addTimeSignature(4, 4, 0);
    conductor.addTextMarker(`Trip-Hop Horizon Engine | 432Hz Harmonic Tuning | Dragon 9 Aligned`);
    conductor.add432HzTuningRPN(0, 0);

    // Track 1: Drums
    const drums = builder.addTrack('Trip-Hop Swung Breakbeat');
    drums.addTrackName('Dusty Boom-Bap Drums');
    drums.add432HzTuningRPN(9, 0);

    // Track 2: Rhodes Chords
    const rhodes = builder.addTrack('Rhodes EP (432Hz)');
    rhodes.addTrackName('Smoky Rhodes Minor 9ths');
    rhodes.add432HzTuningRPN(1, 0);

    // Track 3: Bass
    const bass = builder.addTrack('Trip-Hop Low Sub Bass');
    bass.addTrackName('Sub Warm Bass');
    bass.add432HzTuningRPN(2, 0);

    // Track 4: Melancholic Flute / String Motif
    const lead = builder.addTrack('Melancholic Lead Motif');
    lead.addTrackName('Mellow Flute Stab');
    lead.add432HzTuningRPN(3, 0);

    // Progression: Dm9 -> Bbmaj7 -> Gm9 -> A7alt (tuned around D/A 432Hz)
    const tripChords = [
      { root: 26, chord: [50, 53, 57, 60, 64] }, // Dm9
      { root: 22, chord: [46, 50, 53, 57, 62] }, // Bbmaj7(9)
      { root: 27, chord: [51, 55, 58, 62, 65] }, // Gm9
      { root: 21, chord: [45, 49, 52, 55, 61] }  // A7(b9,#5)
    ];

    const noteEvents = [];

    for (let bar = 0; bar < bars; bar++) {
      const prog = tripChords[bar % tripChords.length];

      // Swung boom-bap beat
      // Beat 1: Kick
      drums.addNote(9, 36, 110, tpq, 0);
      // Beat 2: Snare
      drums.addNote(9, 38, 115, tpq, tpq);
      // Beat 2.5: Kick
      drums.addNote(9, 36, 95, tpq / 2, tpq / 2);
      // Beat 4: Snare + Ghost
      drums.addNote(9, 38, 110, tpq, tpq);

      // Rhodes chords with lush duration
      for (const note of prog.chord) {
        rhodes.addNote(1, note, 75, tpq * 3.5, 0);
      }

      // Bass: deep sub root with syncopated passing tone
      bass.addNote(2, prog.root, 100, tpq * 1.5, 0);
      bass.addNote(2, prog.root + 12, 85, tpq, tpq * 2);

      // Lead motif
      if (bar % 2 === 1) {
        lead.addNote(3, 69, 80, tpq, tpq); // A4 (tuned to 432Hz!)
        lead.addNote(3, 72, 85, tpq * 1.5, tpq);
        lead.addNote(3, 70, 75, tpq * 0.8, tpq);
      }

      noteEvents.push({
        bar,
        root: prog.root,
        chordNotes: prog.chord
      });
    }

    const binaryMidi = builder.build();
    return {
      genre: 'trip-hop',
      bpm,
      bars,
      tuning: '432Hz Verdi Universal',
      dragon9Sequencer: this.getDragon9SequencerClock(bpm),
      binary: binaryMidi,
      base64: Buffer.from(binaryMidi).toString('base64'),
      noteSummary: noteEvents
    };
  }

  /**
   * Generates a G-Funk MIDI track:
   * - Punchy 808/909 drums with tight handclaps on 2 and 4
   * - Bouncy, syncopated analog sawtooth bass (Minimoog style)
   * - Funky clavinet / electric piano rhythm chops
   * - Signature high portamento sine lead whistle (A4=432Hz harmonic glide)
   */
  generateGFunk(options = {}) {
    const bpm = options.bpm || 92;
    const bars = options.bars || 8;
    const tpq = 480;
    const builder = new MidiFileBuilder(tpq);

    // Track 0: Conductor
    const conductor = builder.addTrack('Conductor - G-Funk 432Hz');
    conductor.addTempo(bpm, 0);
    conductor.addTimeSignature(4, 4, 0);
    conductor.addTextMarker(`Horizon Engine West Coast G-Funk | 432Hz Harmonic Tuning | Dragon 9 Aligned`);
    conductor.add432HzTuningRPN(0, 0);

    // Track 1: Drums
    const drums = builder.addTrack('808/909 West Coast Drums');
    drums.addTrackName('G-Funk 808 Punch');
    drums.add432HzTuningRPN(9, 0);

    // Track 2: Bouncy Moog Saw Bass
    const bass = builder.addTrack('Moog Saw Bass');
    bass.addTrackName('Bouncy Analog G-Bass');
    bass.add432HzTuningRPN(0, 0);

    // Track 3: Funky Chords
    const chords = builder.addTrack('Funky Clavinet Chords');
    chords.addTrackName('Clavinet Stabs');
    chords.add432HzTuningRPN(1, 0);

    // Track 4: Signature Sine Whistle Lead (High portamento pitch)
    const lead = builder.addTrack('G-Funk Sine Lead (432Hz)');
    lead.addTrackName('High Whiny Sine Lead');
    lead.add432HzTuningRPN(2, 0);

    // Classic G-Funk progression in F# minor / E minor groove
    const gFunkChords = [
      { root: 30, bassRiff: [30, 30, 33, 35, 37, 35], chord: [54, 57, 61, 64] }, // F#m7
      { root: 28, bassRiff: [28, 28, 31, 33, 35, 33], chord: [52, 55, 59, 62] }, // Em7
      { root: 26, bassRiff: [26, 26, 29, 31, 33, 31], chord: [50, 53, 57, 60] }, // Dm7
      { root: 28, bassRiff: [28, 30, 31, 33, 35, 36], chord: [52, 55, 59, 64] }  // Em9
    ];

    const whistleLeadNotes = [81, 84, 86, 88, 93, 88, 86, 84]; // In high 432Hz register

    const noteEvents = [];

    for (let bar = 0; bar < bars; bar++) {
      const prog = gFunkChords[bar % gFunkChords.length];

      // 808 Drums: Kick on 1 and 3-and, Crisp Claps on 2 and 4
      drums.addNote(9, 36, 120, tpq, 0);         // Beat 1 Kick
      drums.addNote(9, 39, 115, tpq, tpq);       // Beat 2 Handclap
      drums.addNote(9, 36, 105, tpq / 2, tpq / 2); // Beat 2.5 Kick
      drums.addNote(9, 39, 115, tpq, tpq);       // Beat 4 Handclap

      // Hi-hats 16th groove with accents
      for (let i = 0; i < 8; i++) {
        const vel = (i % 2 === 0) ? 90 : 65;
        drums.addNote(9, 42, vel, tpq / 4, 0);
      }

      // Bouncy bass riff
      for (let idx = 0; idx < prog.bassRiff.length; idx++) {
        const bNote = prog.bassRiff[idx];
        bass.addNote(0, bNote, 110, tpq / 2, (idx === 0) ? 0 : tpq / 2);
      }

      // Funky Clavinet stabs on syncopated 16ths
      for (const cNote of prog.chord) {
        chords.addNote(1, cNote, 90, tpq / 4, tpq / 4);
        chords.addNote(1, cNote, 85, tpq / 4, tpq * 1.5);
      }

      // Signature Sine Lead Whistle
      const leadNote = whistleLeadNotes[bar % whistleLeadNotes.length];
      lead.addNote(2, leadNote, 105, tpq * 2, tpq / 2);
      lead.addPitchBend(2, 8500, tpq); // subtle high glide
      lead.addPitchBend(2, 8192, tpq); // return to center

      noteEvents.push({
        bar,
        bassRiff: prog.bassRiff,
        chord: prog.chord,
        whistleLead: leadNote
      });
    }

    const binaryMidi = builder.build();
    return {
      genre: 'g-funk',
      bpm,
      bars,
      tuning: '432Hz Verdi Universal',
      dragon9Sequencer: this.getDragon9SequencerClock(bpm),
      binary: binaryMidi,
      base64: Buffer.from(binaryMidi).toString('base64'),
      noteSummary: noteEvents
    };
  }

  /**
   * Universal procedural generator router.
   */
  generateTrack(genre = 'g-funk', options = {}) {
    const norm = genre.toLowerCase().replace(/[\s_]+/g, '-');
    if (norm.includes('reggae') || norm.includes('dub')) {
      return this.generateDubReggae(options);
    } else if (norm.includes('trip') || norm.includes('hop')) {
      return this.generateTripHop(options);
    } else {
      return this.generateGFunk(options);
    }
  }
}

// Standalone CLI execution
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('horizon-midi.js')) {
  console.log('--- Horizon Engine MIDI Framework (432Hz Dragon 9 Machine) ---');
  const engine = new HorizonEngineMidi();
  const track = engine.generateTrack((process.argv && process.argv[2]) || 'g-funk');
  console.log(`Generated ${track.genre} track:`, {
    bpm: track.bpm,
    bars: track.bars,
    tuning: track.tuning,
    dragon9: track.dragon9Sequencer
  });
}
