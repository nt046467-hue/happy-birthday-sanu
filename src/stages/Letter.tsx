import { motion } from 'framer-motion';
import { useStage } from '../state/useStage';
import { playChime } from '../engine/audio';
import { spawnHearts } from '../engine/particles';
import { content } from '../config/content';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';

export default function Letter() {
  const { nextStage } = useStage();

  const handleContinue = () => {
    playChime();
    spawnHearts(20);
    nextStage();
  };

  return (
    <motion.div
      className="stage-container px-4 py-6 overflow-y-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="flex flex-col items-center gap-4 max-w-md my-auto">
        {/* Ribbon / Badge */}
        <div className="text-3xl select-none animate-bounce">
          {content.letter.badge}
        </div>

        <h2 className="title-text text-center text-xl sm:text-2xl">
          {content.letter.title}
        </h2>

        {/* Letter body */}
        <div className="space-y-3.5 text-left text-xs sm:text-sm text-pink-100/90 leading-relaxed font-normal bg-black/20 p-4 sm:p-5 rounded-2xl border border-pink-500/10">
          {content.letter.paragraphs.map((p, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.15, duration: 0.4 }}
              className={p.emphasis ? 'font-bold text-pink-200 text-sm sm:text-base text-center mt-2' : ''}
            >
              {p.text}
            </motion.p>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="pt-2 text-right font-serif italic text-purple-300 font-bold"
          >
            {content.letter.signature}
          </motion.div>
        </div>

        {/* Pulsing hearts row */}
        <div className="flex gap-2 text-2xl select-none animate-pulse my-1">
          <span>💖</span>
          <span>💍</span>
          <span>💌</span>
        </div>

        <p className="text-center font-serif italic text-sm text-amber-300/90 font-medium">
          {content.letter.tagline}
        </p>

        <div className="pt-2">
          <PrimaryButton onClick={handleContinue} className="px-8 py-3 text-base">
            One last whisper for you 💖
          </PrimaryButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}
