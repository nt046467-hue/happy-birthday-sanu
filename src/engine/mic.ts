/**
 * Dedicated Microphone Blow Detection Module
 *
 * Rules:
 * 1. Dedicated AudioContext separate from SFX/music audio context.
 * 2. Never request on stage mount; only on user gesture.
 * 3. Fully release stream, tracks, audio context on stop().
 * 4. Idempotent stop().
 * 5. Auto stop on visibilitychange (hidden) and pagehide.
 */

let micCtx: AudioContext | null = null;
let micSource: MediaStreamAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;
let micStream: MediaStream | null = null;
let dataArr: Uint8Array<ArrayBuffer> | null = null;
let noiseFloor = 0.01;
let calibrated = false;
let calibrationSamples: number[] = [];
let calAnimId: number | null = null;
let isStarting = false;
let isRunning = false;

function getRMSRaw(): number {
  if (!analyser || !dataArr) return 0;
  analyser.getByteTimeDomainData(dataArr);
  let sum = 0;
  for (let i = 0; i < dataArr.length; i++) {
    const v = (dataArr[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / dataArr.length);
}

/**
 * Start microphone capture and calibration.
 * MUST be invoked from a user gesture (e.g. tapping "Blow the candles").
 */
export async function startMic(): Promise<boolean> {
  if (isRunning || isStarting) return isRunning;
  isStarting = true;

  try {
    // 1. Fully stop any previous session
    await stopMic();

    // 2. Request mic stream
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
      video: false,
    });

    // 3. Create dedicated AudioContext
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    micCtx = new AudioContextClass();
    if (micCtx.state === 'suspended') {
      await micCtx.resume();
    }

    // 4. Source -> AnalyserNode (fftSize 512)
    micSource = micCtx.createMediaStreamSource(micStream);
    analyser = micCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    dataArr = new Uint8Array(new ArrayBuffer(analyser.fftSize));
    micSource.connect(analyser);

    // 5. Calibrate noise floor for 400ms
    calibrated = false;
    calibrationSamples = [];
    const calStart = performance.now();

    const calLoop = () => {
      if (!micCtx || !analyser) return;

      if (performance.now() - calStart > 400) {
        if (calibrationSamples.length > 0) {
          const avg = calibrationSamples.reduce((a, b) => a + b, 0) / calibrationSamples.length;
          noiseFloor = Math.max(avg * 1.3, 0.008);
        }
        calibrated = true;
        calAnimId = null;
        return;
      }

      calibrationSamples.push(getRMSRaw());
      calAnimId = requestAnimationFrame(calLoop);
    };

    calAnimId = requestAnimationFrame(calLoop);
    isRunning = true;
    isStarting = false;
    return true;
  } catch {
    await stopMic();
    isStarting = false;
    return false;
  }
}

/**
 * Fully releases all mic resources in exact order.
 * Idempotent: safe to call multiple times.
 */
export async function stopMic(): Promise<void> {
  isRunning = false;
  isStarting = false;
  calibrated = false;
  calibrationSamples = [];

  // 1. Cancel calibration rAF
  if (calAnimId !== null) {
    cancelAnimationFrame(calAnimId);
    calAnimId = null;
  }

  // 2. Disconnect source and analyser
  if (micSource) {
    try {
      micSource.disconnect();
    } catch {
      /* ignore */
    }
    micSource = null;
  }

  if (analyser) {
    try {
      analyser.disconnect();
    } catch {
      /* ignore */
    }
    analyser = null;
  }

  // 3. Stop each stream track so OS indicator vanishes immediately
  if (micStream) {
    try {
      micStream.getTracks().forEach((track) => {
        track.stop();
      });
    } catch {
      /* ignore */
    }
    micStream = null;
  }

  // 4. Close dedicated mic AudioContext
  if (micCtx && micCtx.state !== 'closed') {
    try {
      await micCtx.close();
    } catch {
      /* ignore */
    }
  }
  micCtx = null;
  dataArr = null;
}

/**
 * Read current blow strength: 0 (ambient noise) to 1 (strong breath).
 */
export function getBlowStrength(): number {
  if (!isRunning || !calibrated) return 0;
  const rms = getRMSRaw();
  const adjusted = Math.max(0, rms - noiseFloor);
  return Math.min(1, adjusted / 0.10);
}

export function isMicActive(): boolean {
  return isRunning && calibrated;
}

export function getMicDebugInfo(): { active: boolean; trackState?: string } {
  const track = micStream?.getAudioTracks()[0];
  return {
    active: isRunning,
    trackState: track ? track.readyState : 'none',
  };
}

// Auto-stop on page visibility change or pagehide
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopMic();
    }
  });

  window.addEventListener('pagehide', () => {
    stopMic();
  });
}

export const mic = {
  start: startMic,
  stop: stopMic,
  getStrength: getBlowStrength,
  isActive: isMicActive,
  getDebugInfo: getMicDebugInfo,
};
