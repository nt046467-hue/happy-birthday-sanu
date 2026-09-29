/**
 * Device performance tier detection and FPS monitor.
 * Tiers: high (250 particles, 2 DPR), mid (140, 1.5), low (70, 1).
 * Auto-downgrades if avg FPS < 45 for 1.5s.
 */
import type { DeviceTier } from '../state/useStage';

interface TierConfig {
  maxParticles: number;
  dprCap: number;
  enableGlow: boolean;
  enableSmoke: boolean;
}

export const TIER_CONFIG: Record<DeviceTier, TierConfig> = {
  high: { maxParticles: 250, dprCap: 2, enableGlow: true, enableSmoke: true },
  mid:  { maxParticles: 140, dprCap: 1.5, enableGlow: true, enableSmoke: true },
  low:  { maxParticles: 70,  dprCap: 1, enableGlow: false, enableSmoke: false },
};

/**
 * Quick device tier detection based on hardware signals.
 * Called once at Gate stage.
 */
export function detectTier(): DeviceTier {
  if (typeof navigator === 'undefined') return 'mid';

  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4;
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth < 400;

  if (cores >= 6 && memory >= 4 && !isSmallScreen) return 'high';
  if (cores <= 2 || memory <= 2 || (isMobile && isSmallScreen)) return 'low';
  return 'mid';
}

/**
 * FPS monitor — tracks rolling average.
 * Call `fpsTick()` every frame, `fpsAvg()` to read.
 */
const FPS_WINDOW = 60; // frames to average
const fpsSamples: number[] = [];
let fpsLastTime = 0;

export function fpsTick(now: number) {
  if (fpsLastTime > 0) {
    const dt = now - fpsLastTime;
    if (dt > 0) {
      fpsSamples.push(1000 / dt);
      if (fpsSamples.length > FPS_WINDOW) fpsSamples.shift();
    }
  }
  fpsLastTime = now;
}

export function fpsAvg(): number {
  if (fpsSamples.length === 0) return 60;
  return fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
}

/**
 * Auto-downgrade: call periodically. Returns new tier if downgrade needed.
 */
let lowFpsStart = 0;

export function checkDowngrade(currentTier: DeviceTier): DeviceTier | null {
  const avg = fpsAvg();
  if (avg < 45) {
    if (lowFpsStart === 0) lowFpsStart = performance.now();
    if (performance.now() - lowFpsStart > 1500) {
      lowFpsStart = 0;
      if (currentTier === 'high') return 'mid';
      if (currentTier === 'mid') return 'low';
    }
  } else {
    lowFpsStart = 0;
  }
  return null;
}
