/**
 * Pooled canvas particle system.
 * Supports: confetti (flutter/tumble), sparks, petals/hearts, smoke, notes.
 * One canvas, object-pooled, max particles per tier, rAF-driven.
 */

import { registerLoop, unregisterLoop } from './loop';
import { TIER_CONFIG } from './perf';
import type { DeviceTier } from '../state/useStage';

export type ParticleType = 'confetti' | 'spark' | 'petal' | 'heart' | 'smoke' | 'note';

interface Particle {
  active: boolean;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  // Confetti flutter
  flipPhase: number;
  flipSpeed: number;
  gravity: number;
  drag: number;
  swayAmp: number;
  swayFreq: number;
  opacity: number;
}

const POOL_SIZE = 300;
const pool: Particle[] = [];
let canvas: HTMLCanvasElement | null = null;
let ctxCanvas: CanvasRenderingContext2D | null = null;
let currentTier: DeviceTier = 'mid';
let activeCount = 0;

// Initialize pool
for (let i = 0; i < POOL_SIZE; i++) {
  pool.push(createEmptyParticle());
}

function createEmptyParticle(): Particle {
  return {
    active: false,
    type: 'confetti',
    x: 0, y: 0, vx: 0, vy: 0,
    life: 0, maxLife: 1, size: 5,
    color: '#fff',
    rotation: 0, rotSpeed: 0,
    flipPhase: 0, flipSpeed: 0,
    gravity: 0, drag: 0,
    swayAmp: 0, swayFreq: 0,
    opacity: 1,
  };
}

function getFromPool(): Particle | null {
  const max = TIER_CONFIG[currentTier].maxParticles;
  if (activeCount >= max) return null;
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].active) {
      pool[i].active = true;
      activeCount++;
      return pool[i];
    }
  }
  return null;
}

export function initParticleCanvas(canvasEl: HTMLCanvasElement, tier: DeviceTier) {
  canvas = canvasEl;
  ctxCanvas = canvasEl.getContext('2d');
  currentTier = tier;
  resizeCanvas();
  registerLoop('particles', updateAndDraw);
}

export function destroyParticleCanvas() {
  unregisterLoop('particles');
  canvas = null;
  ctxCanvas = null;
  activeCount = 0;
  pool.forEach(p => { p.active = false; });
}

export function setParticleTier(tier: DeviceTier) {
  currentTier = tier;
  resizeCanvas();
}

function resizeCanvas() {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio, TIER_CONFIG[currentTier].dprCap);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  if (ctxCanvas) ctxCanvas.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Listen for resize
if (typeof window !== 'undefined') {
  window.addEventListener('resize', resizeCanvas);
}

const BRAND_COLORS = ['#f472b6', '#c084fc', '#fbbf24', '#38bdf8', '#34d399', '#fb923c'];

/** Spawn confetti burst */
/** Spawn confetti burst - upward fountain if origin is provided */
export function spawnConfetti(count: number, originX?: number, originY?: number) {
  const cx = originX ?? window.innerWidth / 2;
  const cy = originY ?? window.innerHeight * 0.5;
  const isTargeted = originY !== undefined;

  for (let i = 0; i < count; i++) {
    const p = getFromPool();
    if (!p) break;

    // Upward fountain arc if targeted
    const angle = isTargeted
      ? -Math.PI * 0.15 - Math.random() * Math.PI * 0.70 // Aimed upwards (fan)
      : Math.random() * Math.PI * 2;
    const speed = isTargeted ? 260 + Math.random() * 320 : 120 + Math.random() * 280;

    Object.assign(p, {
      type: 'confetti' as ParticleType,
      x: cx + (Math.random() - 0.5) * 30,
      y: cy + (Math.random() - 0.5) * 15,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 2.8 + Math.random() * 1.5,
      size: 4.5 + Math.random() * 5.5,
      color: BRAND_COLORS[i % BRAND_COLORS.length],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 8,
      flipPhase: Math.random() * Math.PI * 2,
      flipSpeed: 3 + Math.random() * 5,
      gravity: 360 + Math.random() * 80,
      drag: 0.965,
      swayAmp: 25 + Math.random() * 45,
      swayFreq: 2 + Math.random() * 2,
      opacity: 1,
    });
  }
}

/** Spawn sparks from a point */
export function spawnSparks(count: number, x: number, y: number) {
  for (let i = 0; i < count; i++) {
    const p = getFromPool();
    if (!p) break;
    const angle = Math.random() * Math.PI * 2;
    const speed = 70 + Math.random() * 180;
    Object.assign(p, {
      type: 'spark' as ParticleType,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      life: 0,
      maxLife: 0.45 + Math.random() * 0.5,
      size: 1.5 + Math.random() * 3,
      color: ['#fbbf24', '#fff', '#fde68a', '#ff8fcb', '#c084fc'][Math.floor(Math.random() * 5)],
      gravity: 140,
      drag: 0.95,
      opacity: 1,
      rotation: 0, rotSpeed: 0, flipPhase: 0, flipSpeed: 0, swayAmp: 0, swayFreq: 0,
    });
  }
}

/** Spawn cake crumbs and cream flakes during slicing */
export function spawnCrumbs(count: number, x: number, y: number) {
  const crumbColors = ['#fef08a', '#fed7aa', '#f472b6', '#ffffff', '#fbbf24'];
  for (let i = 0; i < count; i++) {
    const p = getFromPool();
    if (!p) break;
    const angle = Math.random() * Math.PI * 2;
    const speed = 25 + Math.random() * 70;
    Object.assign(p, {
      type: 'spark' as ParticleType,
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + 20,
      life: 0,
      maxLife: 0.6 + Math.random() * 0.5,
      size: 1.5 + Math.random() * 2.5,
      color: crumbColors[Math.floor(Math.random() * crumbColors.length)],
      gravity: 240,
      drag: 0.94,
      opacity: 0.9,
      rotation: 0, rotSpeed: 0, flipPhase: 0, flipSpeed: 0, swayAmp: 0, swayFreq: 0,
    });
  }
}

/** Spawn hearts floating upward from an origin or the bottom */
export function spawnHearts(count: number, originX?: number, originY?: number) {
  for (let i = 0; i < count; i++) {
    const p = getFromPool();
    if (!p) break;
    const hasOrigin = originX !== undefined && originY !== undefined;
    const startX = hasOrigin ? originX + (Math.random() - 0.5) * 60 : Math.random() * window.innerWidth;
    const startY = hasOrigin ? originY + (Math.random() - 0.5) * 30 : window.innerHeight + 20;

    Object.assign(p, {
      type: 'heart' as ParticleType,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 60,
      vy: -(60 + Math.random() * 90),
      life: 0,
      maxLife: 3.5 + Math.random() * 2.5,
      size: 8 + Math.random() * 12,
      color: ['#f472b6', '#c084fc', '#fbbf24', '#ff6584'][Math.floor(Math.random() * 4)],
      gravity: -10,
      drag: 0.99,
      opacity: 0.8 + Math.random() * 0.2,
      swayAmp: 20 + Math.random() * 30,
      swayFreq: 1 + Math.random() * 1.5,
      rotation: 0, rotSpeed: 0, flipPhase: Math.random() * Math.PI * 2, flipSpeed: 0,
    });
  }
}

function updateAndDraw(dt: number, elapsed: number) {
  if (!ctxCanvas || !canvas) return;
  ctxCanvas.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    if (!p.active) continue;

    p.life += dt;
    if (p.life >= p.maxLife) {
      p.active = false;
      activeCount--;
      continue;
    }

    const lifeRatio = p.life / p.maxLife;

    // Physics
    p.vy += p.gravity * dt;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Sway
    if (p.swayAmp > 0) {
      p.x += Math.sin((elapsed + p.flipPhase) * p.swayFreq) * p.swayAmp * dt;
    }

    // Rotation
    p.rotation += p.rotSpeed * dt;

    // Fade out in last 30%
    const alpha = lifeRatio > 0.7 ? p.opacity * (1 - (lifeRatio - 0.7) / 0.3) : p.opacity;

    ctxCanvas.save();
    ctxCanvas.globalAlpha = Math.max(0, alpha);
    ctxCanvas.translate(p.x, p.y);

    switch (p.type) {
      case 'confetti': {
        // Flutter: scale-x oscillation simulates tumbling
        const flipX = Math.cos((elapsed + p.flipPhase) * p.flipSpeed);
        ctxCanvas.rotate(p.rotation);
        ctxCanvas.scale(flipX, 1);
        ctxCanvas.fillStyle = p.color;
        ctxCanvas.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        break;
      }
      case 'spark': {
        ctxCanvas.fillStyle = p.color;
        ctxCanvas.beginPath();
        ctxCanvas.arc(0, 0, p.size, 0, Math.PI * 2);
        ctxCanvas.fill();
        break;
      }
      case 'heart': {
        drawHeart(ctxCanvas, p.size, p.color);
        break;
      }
      case 'petal': {
        ctxCanvas.rotate(p.rotation);
        ctxCanvas.fillStyle = p.color;
        ctxCanvas.beginPath();
        ctxCanvas.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
        ctxCanvas.fill();
        break;
      }
      case 'smoke': {
        ctxCanvas.fillStyle = `rgba(200, 200, 220, ${alpha * 0.4})`;
        ctxCanvas.beginPath();
        ctxCanvas.arc(0, 0, p.size * (1 + lifeRatio * 0.5), 0, Math.PI * 2);
        ctxCanvas.fill();
        break;
      }
      case 'note': {
        ctxCanvas.fillStyle = p.color;
        ctxCanvas.font = `${p.size}px sans-serif`;
        ctxCanvas.textAlign = 'center';
        ctxCanvas.fillText('♪', 0, 0);
        break;
      }
    }

    ctxCanvas.restore();
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  const s = size / 2;
  ctx.moveTo(0, s * 0.3);
  ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.5, s * 0.3, 0, s * 1.2);
  ctx.bezierCurveTo(s * 1.5, s * 0.3, s, -s * 0.5, 0, s * 0.3);
  ctx.fill();
}

export function getActiveParticleCount() { return activeCount; }
