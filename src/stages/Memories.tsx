import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStage } from '../state/useStage';
import { playChime, playPop } from '../engine/audio';
import { spawnHearts, spawnConfetti } from '../engine/particles';
import { content } from '../config/content';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';

export default function Memories() {
  const { stage, nextStage } = useStage();
  const memoryIndex = stage === 'memories1' ? 0 : 1;
  const item = content.memories[memoryIndex] || content.memories[0];

  const [showPartyBanner, setShowPartyBanner] = useState(false);
  const [cuteBtnText, setCuteBtnText] = useState(item.secondaryButtonText || "You're too cute 😘");
  const cuteIndexRef = useState(0);

  const cuteMessages = [
    "You are impossibly beautiful, Karu! 💕",
    "My love for you never stops! 💖",
    "Everything about you is perfect! 😍💕",
    "You are my favourite everything 🌸",
  ];

  const handleNext = () => {
    playChime();
    playPop();

    if (stage === 'memories2') {
      // Show Party Celebration Overlay before unwrap
      setShowPartyBanner(true);
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.45;
      spawnConfetti(80, cx, cy);
      spawnHearts(16, cx, cy);

      setTimeout(() => {
        nextStage();
      }, 1600);
    } else {
      nextStage();
    }
  };

  const handleSecondary = () => {
    playChime();
    spawnHearts(10, window.innerWidth / 2, window.innerHeight * 0.7);

    // Cycle cute response text
    const nextIdx = (cuteIndexRef[0] + 1) % cuteMessages.length;
    cuteIndexRef[0] = nextIdx;
    setCuteBtnText(cuteMessages[nextIdx]);

    setTimeout(() => {
      setCuteBtnText(item.secondaryButtonText || "You're too cute 😘");
    }, 2400);
  };

  return (
    <motion.div
      key={stage}
      className="stage-container"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="flex flex-col items-center gap-4 max-w-sm">
        {/* Memory Media (Tenor GIF with fallback) */}
        <div className="w-52 h-52 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-lg border border-pink-500/20 bg-purple-950/30 flex items-center justify-center">
          <img
            src={item.src}
            alt={item.title}
            className="w-full h-full object-cover select-none"
            loading="eager"
            onError={(e) => {
              if (item.fallbackSrc) {
                (e.target as HTMLImageElement).src = item.fallbackSrc;
              }
            }}
          />
        </div>

        <h2 className="title-text text-center text-xl sm:text-2xl mt-1">
          {item.title}
        </h2>

        <p className="subtitle-text text-center text-xs sm:text-sm px-2">
          {item.text}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full justify-center">
          <PrimaryButton onClick={handleNext} className="w-full sm:w-auto px-6 py-2.5 text-sm shadow-lg shadow-pink-500/25">
            {item.primaryButtonText}
          </PrimaryButton>

          {item.secondaryButtonText && (
            <PrimaryButton
              variant="secondary"
              onClick={handleSecondary}
              className="w-full sm:w-auto px-5 py-2.5 text-sm"
            >
              {cuteBtnText}
            </PrimaryButton>
          )}
        </div>
      </GlassCard>

      {/* Party Celebration Overlay */}
      <AnimatePresence>
        {showPartyBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <div className="glass-card flex flex-col items-center gap-3 max-w-sm text-center py-8">
              <div className="text-4xl animate-bounce">🎉 🎂 ✨</div>
              <h2 className="title-text text-2xl sm:text-3xl">
                {content.partyOverlay.title}
              </h2>
              <p className="subtitle-text text-sm sm:text-base font-semibold text-pink-200">
                {content.partyOverlay.subtitle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
