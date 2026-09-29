import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStage } from '../../state/useStage';
import { playSliceWhoosh, playCutComplete } from '../../engine/audio';
import { tick, buzzPattern } from '../../engine/haptics';
import { spawnConfetti, spawnHearts, spawnSparks, spawnCrumbs } from '../../engine/particles';
import { content } from '../../config/content';
import PrimaryButton from '../../components/PrimaryButton';
import CakeModel from '../Cake/CakeModel';
import { CAKE_GEOMETRY } from '../Cake/cakeGeometry';

export default function CutScene() {
  const { nextStage, setCutComplete } = useStage();
  const [cutProgress, setCutProgress] = useState(0); // 0 to 1
  const [isCutDone, setIsCutDone] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Knife Position & Rotation
  // Default idle position: resting on right side of cake
  const [knifeState, setKnifeState] = useState({
    x: 235,
    y: 110,
    angle: -25,
    lifted: false,
  });

  const boardRef = useRef<HTMLDivElement>(null);
  const targetPosRef = useRef({ x: 235, y: 110 });
  const currentPosRef = useRef({ x: 235, y: 110, angle: -25 });
  const lastMoveTimeRef = useRef(0);
  const lastYRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const cutDoneRef = useRef(false);

  // Smooth Knife Follow Loop (Lerp ~0.25)
  useEffect(() => {
    const loop = () => {
      if (!cutDoneRef.current) {
        const cur = currentPosRef.current;
        const target = targetPosRef.current;

        // Smooth position
        const dx = target.x - cur.x;
        const dy = target.y - cur.y;
        cur.x += dx * 0.28;
        cur.y += dy * 0.28;

        // Dynamic knife tilt according to movement direction
        const speed = Math.hypot(dx, dy);
        let targetAngle = -25;
        if (speed > 1.5) {
          targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
          // Clamp angle between -60 and 20 degrees for natural slicing posture
          targetAngle = Math.max(-60, Math.min(20, targetAngle));
        }
        cur.angle += (targetAngle - cur.angle) * 0.18;

        setKnifeState({
          x: cur.x,
          y: cur.y,
          angle: cur.angle,
          lifted: false,
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (cutDoneRef.current) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsInteracting(true);
    lastMoveTimeRef.current = performance.now();
    lastYRef.current = e.clientY;
    updateTargetPos(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (cutDoneRef.current) return;
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Check if pointer is inside cake vertical slicing corridor (x: 150 +- 45, y: 65 to 265)
    // Scale board coordinate: board is 288x300, SVG viewBox is 300x320
    const scaleX = 300 / rect.width;
    const scaleY = 320 / rect.height;
    const svgX = rawX * scaleX;
    const svgY = rawY * scaleY;

    const inCakeCorridor =
      Math.abs(svgX - CAKE_GEOMETRY.cutLineX) < 42 &&
      svgY >= CAKE_GEOMETRY.cutStartY - 10 &&
      svgY <= CAKE_GEOMETRY.cutEndY + 20;

    const now = performance.now();
    const dt = Math.max(1, now - lastMoveTimeRef.current);

    if (inCakeCorridor && lastYRef.current !== null) {
      const clientDy = e.clientY - lastYRef.current;
      const speed = Math.abs(clientDy) / dt * 60;

      // Resistance: inside the cake, movement is slowed down (~0.6x)
      const targetY = currentPosRef.current.y + (rawY - currentPosRef.current.y) * 0.62;
      targetPosRef.current = {
        x: CAKE_GEOMETRY.cutLineX / scaleX, // locks knife near cut center
        y: targetY,
      };

      if (clientDy > 1.2) {
        // Slicing downward
        playSliceWhoosh(speed);
        tick();

        // Spawn cake crumb particles at blade tip
        spawnCrumbs(2, e.clientX, e.clientY);

        // Progress calculation
        const totalHeight = CAKE_GEOMETRY.cutEndY - CAKE_GEOMETRY.cutStartY;
        const currentCutY = Math.max(0, svgY - CAKE_GEOMETRY.cutStartY);
        const progress = Math.min(1, currentCutY / totalHeight);

        setCutProgress((prev) => {
          const next = Math.max(prev, progress);
          if (next >= 0.96 && !cutDoneRef.current) {
            triggerCutComplete();
          }
          return next;
        });
      }
    } else {
      // Outside cake: knife moves freely
      targetPosRef.current = { x: rawX, y: rawY };
    }

    lastYRef.current = e.clientY;
    lastMoveTimeRef.current = now;
  };

  const handlePointerUp = () => {
    setIsInteracting(false);
    lastYRef.current = null;
    if (!cutDoneRef.current) {
      // Ease knife to side if released early without resetting cut progress
      targetPosRef.current = { x: 235, y: 110 };
    }
  };

  const updateTargetPos = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    targetPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const triggerCutComplete = () => {
    cutDoneRef.current = true;
    setIsCutDone(true);
    setCutProgress(1);

    // Spring lift knife away
    setKnifeState((prev) => ({ ...prev, y: -80, angle: -10, lifted: true }));

    // Sound & Haptic
    playCutComplete();
    buzzPattern();

    // Spawn massive celebration fountain from cake center!
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.42;
    spawnConfetti(85, cx, cy);
    spawnHearts(18, cx, cy);
    spawnSparks(40, cx, cy);

    // Update store safely outside render
    setTimeout(() => {
      setCutComplete(true);
    }, 50);

    // Show continue button after celebration
    setTimeout(() => {
      setShowContinue(true);
    }, 700);
  };

  return (
    <motion.div
      className="stage-container px-4"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col items-center max-w-sm w-full mx-auto">
        {/* Title */}
        <h2 className="title-text text-center text-2xl sm:text-3xl mb-1">
          {isCutDone ? '🎂 A Piece of Sweet Love! 💖' : content.cut.instruction}
        </h2>
        <p className="subtitle-text text-center text-xs sm:text-sm mb-3">
          {isCutDone ? content.cut.sliceMessage : content.cut.hint}
        </p>

        {/* Realistic Cutting Board Scene */}
        <div
          ref={boardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center select-none touch-none rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#180024] to-[#0c0012] border border-pink-500/20"
        >
          {/* Shared Cake Model (Cut View) */}
          <CakeModel
            view="cut"
            candles={[false, false, false, false, false]}
            sliceProgress={cutProgress}
            isCutDone={isCutDone}
          />

          {/* Soft Pulsing Guide Line across the cake when idle */}
          {!isCutDone && (
            <motion.div
              animate={{ opacity: isInteracting ? 0.2 : [0.35, 0.85, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute pointer-events-none w-0.5 bg-gradient-to-b from-amber-300 via-pink-400 to-amber-200"
              style={{
                left: '50%',
                top: '22%',
                height: '60%',
                boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
              }}
            />
          )}

          {/* Real Cut Line Appearing behind the blade */}
          {cutProgress > 0 && !isCutDone && (
            <div
              className="absolute pointer-events-none w-[3px] bg-amber-950/80 rounded-full"
              style={{
                left: 'calc(50% - 1.5px)',
                top: '22%',
                height: `${cutProgress * 60}%`,
                borderLeft: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 0 6px rgba(0, 0, 0, 0.6)',
              }}
            />
          )}

          {/* ══════════════════════════════════════════════
              REAL SVG KITCHEN CHEF'S KNIFE (No Emoji!)
          ══════════════════════════════════════════════ */}
          {!knifeState.lifted && (
            <div
              className="absolute pointer-events-none will-change-transform z-30"
              style={{
                left: knifeState.x,
                top: knifeState.y,
                transform: `translate(-25px, -75px) rotate(${knifeState.angle}deg)`,
                transformOrigin: '25px 75px',
              }}
            >
              {/* Drop Shadow Sprite Offset */}
              <div
                className="absolute w-12 h-20 -bottom-2 -right-2 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.4) 0%, transparent 70%)',
                  transform: 'rotate(15deg)',
                }}
              />

              <svg width="50" height="96" viewBox="0 0 50 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Steel Blade Gradient */}
                  <linearGradient id="knifeSteel" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="25%" stopColor="#e2e8f0" />
                    <stop offset="65%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>

                  {/* Dark Walnut / Polymer Handle */}
                  <linearGradient id="knifeHandle" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="40%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#020617" />
                  </linearGradient>

                  {/* Brass Rivet Gradient */}
                  <linearGradient id="knifeRivet" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>
                </defs>

                {/* Handle (Top Portion) */}
                <path
                  d="M20 2 C20 1, 28 1, 30 2 L31 32 C31 34, 28 35, 25 35 C22 35, 19 34, 19 32 Z"
                  fill="url(#knifeHandle)"
                />
                {/* 3 Brass Rivets on Handle */}
                <circle cx="25" cy="8" r="1.6" fill="url(#knifeRivet)" />
                <circle cx="25" cy="18" r="1.6" fill="url(#knifeRivet)" />
                <circle cx="25" cy="28" r="1.6" fill="url(#knifeRivet)" />

                {/* Stainless Steel Bolster Guard */}
                <rect x="18" y="34" width="14" height="4" rx="1.5" fill="#cbd5e1" />

                {/* Chef's Steel Blade */}
                {/* Spine on right, sharp curved cutting edge on left */}
                <path
                  d="M20 38 L30 38 L30 82 C30 88, 26 94, 24 95 C22 93, 17 68, 17 44 C17 40, 19 38, 20 38 Z"
                  fill="url(#knifeSteel)"
                />

                {/* Razor Sharp Bevel Highlight on Cutting Edge */}
                <path
                  d="M17 44 C17 68, 22 93, 24 95"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Crumb & Cream Smear that builds up as cutting progresses */}
                {cutProgress > 0.1 && (
                  <path
                    d={`M18 60 Q21 ${60 + cutProgress * 25} 23 ${70 + cutProgress * 15}`}
                    stroke="rgba(254, 240, 138, 0.85)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Cut Progress Bar */}
        {!isCutDone ? (
          <div className="w-56 h-2.5 bg-white/10 rounded-full overflow-hidden border border-pink-500/20 my-3 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 transition-all duration-75 rounded-full"
              style={{ width: `${cutProgress * 100}%` }}
            />
          </div>
        ) : (
          <AnimatePresence>
            {showContinue && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="pt-4"
              >
                <PrimaryButton onClick={() => nextStage()} className="px-8 py-3 text-base shadow-xl shadow-pink-500/30">
                  {content.cut.buttonText}
                </PrimaryButton>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
