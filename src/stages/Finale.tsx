import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStage } from '../state/useStage';
import { playChime } from '../engine/audio';
import { spawnHearts, spawnConfetti } from '../engine/particles';
import { content } from '../config/content';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';

export default function Finale() {
  const { reset } = useStage();

  useEffect(() => {
    // Initial celebration
    spawnConfetti(60, window.innerWidth / 2, window.innerHeight * 0.35);
    spawnHearts(15);

    // Occasional gentle floating hearts in the background
    const interval = setInterval(() => {
      spawnHearts(3);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const handleReplay = () => {
    playChime();
    reset();
  };

  return (
    <motion.div
      className="stage-container px-4"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="flex flex-col items-center gap-4 max-w-sm">
        {/* Cute Couple GIF */}
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-lg border border-pink-500/20 bg-purple-950/30 flex items-center justify-center">
          <img
            src="https://media.tenor.com/UH5T51ReTJkAAAAM/bubu-dudu-love.gif"
            alt="Endless Love"
            className="w-full h-full object-cover select-none"
            loading="eager"
          />
        </div>

        {/* Big Love Title */}
        <h2 className="title-text text-center text-xl sm:text-2xl whitespace-pre-line">
          {content.finale.bigLove}
        </h2>

        {/* Body Text */}
        <p className="subtitle-text text-center text-xs sm:text-sm px-2">
          {content.finale.body}
        </p>

        {/* Signature */}
        <div className="font-serif italic text-base text-pink-300 font-bold">
          {content.finale.signature}
        </div>

        {/* Pulsing Heart */}
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-3xl select-none"
        >
          💖
        </motion.div>

        {/* Replay Button */}
        <div className="pt-2">
          <PrimaryButton onClick={handleReplay} variant="secondary" className="px-6 py-2.5 text-sm">
            {content.finale.replayCta}
          </PrimaryButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}
