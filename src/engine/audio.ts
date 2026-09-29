/**
 * AudioContext manager: unlock on first user gesture,
 * synthesized SFX, music playback with ducking.
 */

let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let masterGain: GainNode | null = null;
let _unlocked = false;

export function isAudioUnlocked() { return _unlocked; }

/**
 * Create/resume AudioContext. Must be called from a user gesture.
 */
export function unlockAudio(): AudioContext | null {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    if (!masterGain) {
      masterGain = ctx.createGain();
      masterGain.gain.value = 1;
      masterGain.connect(ctx.destination);
    }
    if (!musicGain) {
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.3;
      musicGain.connect(masterGain);
    }
    _unlocked = true;
    return ctx;
  } catch {
    return null;
  }
}

export function getAudioContext() { return ctx; }

/**
 * Play a soft chime (gate entrance).
 */
export function playChime() {
  const ac = ctx;
  if (!ac || !masterGain) return;
  const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ac.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.connect(gain).connect(masterGain!);
    osc.start(t);
    osc.stop(t + 0.85);
  });
}

/**
 * Play a pop sound.
 */
export function playPop() {
  const ac = ctx;
  if (!ac || !masterGain) return;
  const bufSize = 2048;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  }
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filt = ac.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 1800;
  filt.Q.value = 1.2;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.12, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  src.connect(filt).connect(gain).connect(masterGain!);
  src.start();
  src.stop(ac.currentTime + 0.18);
}

/**
 * Soft thud sound (box landing on table).
 */
export function playSoftThud() {
  const ac = ctx;
  if (!ac || !masterGain) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(140, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ac.currentTime + 0.12);
  gain.gain.setValueAtTime(0.18, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  osc.connect(gain).connect(masterGain);
  osc.start();
  osc.stop(ac.currentTime + 0.16);
}

/**
 * Ribbon rustle sound (untying silky ribbon).
 */
export function playRibbonRustle() {
  const ac = ctx;
  if (!ac || !masterGain) return;
  const bufSize = Math.round(ac.sampleRate * 0.18);
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filt = ac.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 3200;
  filt.Q.value = 1.4;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.08, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
  src.connect(filt).connect(gain).connect(masterGain);
  src.start();
  src.stop(ac.currentTime + 0.2);
}

/**
 * Play rising musical note for name reveal hearts (C, E, G, C5).
 */
export function playNote(index: number) {
  const ac = ctx;
  if (!ac || !masterGain) return;
  const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
  const freq = notes[index % notes.length];
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const t = ac.currentTime;
  gain.gain.setValueAtTime(0.1, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  osc.connect(gain).connect(masterGain!);
  osc.start(t);
  osc.stop(t + 0.65);
}

/**
 * Procedural knife-scrape sound (speed-driven pitch and volume).
 */
let lastWhooshAt = 0;
export function playSliceWhoosh(speed: number) {
  const ac = ctx;
  if (!ac || !masterGain) return;
  const now = Date.now();
  if (now - lastWhooshAt < 60) return;
  lastWhooshAt = now;

  const bufSize = 2048;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);

  const src = ac.createBufferSource();
  src.buffer = buf;
  const filt = ac.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 800 + Math.min(speed, 40) * 55;
  filt.Q.value = 0.9;
  const gain = ac.createGain();
  const vol = Math.min(0.16, 0.05 + speed / 220);
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.09);
  src.connect(filt).connect(gain).connect(masterGain!);
  src.start();
  src.stop(ac.currentTime + 0.1);
}

/**
 * Cut-complete chime.
 */
export function playCutComplete() {
  const ac = ctx;
  if (!ac || !masterGain) return;

  // Thump
  const bufSize = Math.round(ac.sampleRate * 0.12);
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filt = ac.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 1400;
  const g1 = ac.createGain();
  g1.gain.setValueAtTime(0.2, ac.currentTime);
  g1.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  src.connect(filt).connect(g1).connect(masterGain!);
  src.start();

  // Chime
  [880, 1174.7, 1567.98].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t0 = ac.currentTime + 0.12 + i * 0.09;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.1, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
    osc.connect(g).connect(masterGain!);
    osc.start(t0);
    osc.stop(t0 + 0.5);
  });
}

/**
 * Duck music volume (e.g., during cheer).
 */
export function duckMusic(amount = 0.4, durationMs = 2000) {
  if (!musicGain || !ctx) return;
  const t = ctx.currentTime;
  musicGain.gain.setValueAtTime(musicGain.gain.value, t);
  musicGain.gain.linearRampToValueAtTime(0.3 * (1 - amount), t + 0.1);
  musicGain.gain.linearRampToValueAtTime(0.3, t + durationMs / 1000);
}

/**
 * Clean up audio on unmount.
 */
export function cleanupAudio() {
  if (ctx && ctx.state !== 'closed') {
    try { ctx.close(); } catch { /* ignore */ }
  }
  ctx = null;
  masterGain = null;
  musicGain = null;
  _unlocked = false;
}
