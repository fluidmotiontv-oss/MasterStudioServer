export class AudioEngine432 {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startDrone() {
    this.init();
    if (this.isPlaying) return;

    this.osc1 = this.audioCtx.createOscillator();
    this.osc2 = this.audioCtx.createOscillator();
    this.gainNode = this.audioCtx.createGain();

    this.osc1.type = 'sine';
    this.osc1.frequency.setValueAtTime(108, this.audioCtx.currentTime);

    this.osc2.type = 'triangle';
    this.osc2.frequency.setValueAtTime(216, this.audioCtx.currentTime);

    this.gainNode.gain.setValueAtTime(0.15, this.audioCtx.currentTime);

    this.osc1.connect(this.gainNode);
    this.osc2.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    this.osc1.start();
    this.osc2.start();
    this.isPlaying = true;
  }

  stopDrone() {
    if (!this.isPlaying) return;
    this.osc1.stop();
    this.osc2.stop();
    this.isPlaying = false;
  }

  triggerApexChime() {
    this.init();
    const chime = this.audioCtx.createOscillator();
    const chimeGain = this.audioCtx.createGain();

    chime.type = 'sine';
    chime.frequency.setValueAtTime(432, this.audioCtx.currentTime);
    chime.frequency.exponentialRampToValueAtTime(864, this.audioCtx.currentTime + 1.5);

    chimeGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 2.0);

    chime.connect(chimeGain);
    chimeGain.connect(this.audioCtx.destination);

    chime.start();
    chime.stop(this.audioCtx.currentTime + 2.0);
  }
}
