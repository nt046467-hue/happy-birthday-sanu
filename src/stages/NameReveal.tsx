import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStage } from '../state/useStage';
import { playNote, playChime } from '../engine/audio';
import { buzzShort } from '../engine/haptics';
import { spawnSparks, spawnConfetti } from '../engine/particles';
import { content } from '../config/content';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';

export default function NameReveal() {
  const { nextStage } = useStage();
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false, false]);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const letters = content.nameReveal.letters;
  const words = content.nameReveal.words;
  const allRevealed = revealed.every(Boolean);

  const handleHeartTap = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (revealed[index]) return;

    playNote(index);
    buzzShort();

    const rect = e.currentTarget.getBoundingClientRect();
    spawnSparks(18, rect.left + rect.width / 2, rect.top + rect.height / 2);

    const nextRevealed = [...revealed];
    nextRevealed[index] = true;
    setRevealed(nextRevealed);
    setActiveWordIndex(index);

    if (nextRevealed.every(Boolean)) {
      setTimeout(() => {
        playChime();
        spawnConfetti(50, window.innerWidth / 2, window.innerHeight * 0.35);
      }, 350);
    }
  };

  const handleContinue = () => {
    nextStage();
  };

  const heartEmojis = ['💖', '💗', '💓', '💞'];

  return (
    <motion.div
      className="stage-container"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="flex flex-col items-center gap-5">
        <h2 className="title-text">{content.nameReveal.title}</h2>
        <p className="subtitle-text text-sm">{content.nameReveal.subtitle}</p>

        {/* Letter Boxes */}
        <div className="flex gap-3 justify-center my-1">
          {letters.map((letter, idx) => (
            <motion.div
              key={idx}
              className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center border border-pink-500/30 bg-purple-950/40 shadow-inner"
              animate={
                revealed[idx]
                  ? { scale: [0.8, 1.15, 1], borderColor: 'rgba(251, 191, 36, 0.6)' }
                  : { scale: 1 }
              }
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <AnimatePresence>
                {revealed[idx] ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    className="font-extrabold text-2xl sm:text-3xl text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                  >
                    {letter}
                  </motion.span>
                ) : (
                  <span className="text-pink-400/30 text-xl font-bold">?</span>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Hearts grid */}
        <div className="flex gap-4 justify-center py-2">
          {heartEmojis.map((emoji, idx) => {
            const isDone = revealed[idx];
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => handleHeartTap(idx, e)}
                disabled={isDone}
                className={`text-3xl sm:text-4xl p-2 rounded-full transition-opacity cursor-pointer ${
                  isDone ? 'opacity-40 grayscale-[40%]' : 'opacity-100 hover:scale-110'
                }`}
                aria-label={`Reveal letter ${letters[idx]}`}
              >
                <motion.span
                  animate={isDone ? {} : { scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: idx * 0.2 }}
                  className="inline-block"
                >
                  {emoji}
                </motion.span>
              </motion.button>
            );
          })}
        </div>

        {/* Word Display Line */}
        <div className="min-h-[48px] flex items-center justify-center px-2">
          <AnimatePresence mode="wait">
            {allRevealed ? (
              <motion.p
                key="all"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base font-bold text-pink-300 drop-shadow text-center"
              >
                {content.nameReveal.completedText}
              </motion.p>
            ) : activeWordIndex !== null ? (
              <motion.p
                key={activeWordIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-sm font-semibold text-amber-200/90 italic text-center"
              >
                {words[activeWordIndex]}
              </motion.p>
            ) : (
              <p className="text-xs text-pink-300/50 tracking-wide uppercase font-semibold">
                Tap each heart to reveal ✨
              </p>
            )}
          </AnimatePresence>
        </div>

        {/* Continue to Cake button */}
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            className="pt-1"
          >
            <PrimaryButton onClick={handleContinue} className="px-8 py-3 text-base">
              Time for cake! 🎂✨
            </PrimaryButton>
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}
