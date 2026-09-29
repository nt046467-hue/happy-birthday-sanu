import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStage } from '../state/useStage';
import { playChime } from '../engine/audio';
import { spawnHearts, spawnConfetti } from '../engine/particles';
import { content } from '../config/content';
import GlassCard from '../components/GlassCard';

export default function Unwrap() {
  const { nextStage } = useStage();
  const wishes = content.unwrap.wishes;
  const [wishIndex, setWishIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const totalDuration = 2800; // ms
    const intervalTime = 40;
    const step = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Sync wish index with progress safely
  useEffect(() => {
    const idx = Math.min(
      wishes.length - 1,
      Math.floor((progress / 100) * wishes.length)
    );
    setWishIndex(idx);

    if (progress >= 100 && !completedRef.current) {
      completedRef.current = true;
      playChime();
      spawnConfetti(70, window.innerWidth / 2, window.innerHeight * 0.4);
      spawnHearts(15, window.innerWidth / 2, window.innerHeight * 0.42);

      const navTimer = setTimeout(() => {
        nextStage();
      }, 450);

      return () => clearTimeout(navTimer);
    }
  }, [progress, wishes.length, nextStage]);

  return (
    <motion.div
      className="stage-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="flex flex-col items-center gap-5 max-w-sm">
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [-6, 6, -6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl select-none drop-shadow-[0_0_15px_rgba(244,114,182,0.4)]"
        >
          🎁
        </motion.div>

        <h3 className="text-lg font-bold text-pink-200 text-center min-h-[32px]">
          {wishes[wishIndex]}
        </h3>

        {/* Progress Bar */}
        <div className="w-56 h-3 bg-white/10 rounded-full overflow-hidden border border-pink-500/20 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Real SVG Sparkle Icons */}
        <div className="flex gap-3 text-xl select-none animate-pulse">
          <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <svg className="w-5 h-5 text-purple-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
          </svg>
          <svg className="w-5 h-5 text-amber-200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
      </GlassCard>
    </motion.div>
  );
}
