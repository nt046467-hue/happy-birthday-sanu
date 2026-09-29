/**
 * Single requestAnimationFrame loop.
 * All per-frame callbacks register here.
 * Pauses when document.hidden. Cleans up on stop.
 */

type LoopCallback = (dt: number, elapsed: number) => void;

const callbacks = new Map<string, LoopCallback>();
let rafId: number | null = null;
let lastTime = 0;
let elapsed = 0;
let running = false;

function tick(now: number) {
  if (!running) return;
  rafId = requestAnimationFrame(tick);

  const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0.016;
  lastTime = now;
  elapsed += dt;

  callbacks.forEach((cb) => cb(dt, elapsed));
}

export function registerLoop(id: string, cb: LoopCallback) {
  callbacks.set(id, cb);
  if (!running) startLoop();
}

export function unregisterLoop(id: string) {
  callbacks.delete(id);
  if (callbacks.size === 0) stopLoop();
}

function startLoop() {
  if (running) return;
  running = true;
  lastTime = 0;
  rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  running = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// Pause when tab is hidden
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
    } else if (callbacks.size > 0) {
      startLoop();
    }
  });
}
