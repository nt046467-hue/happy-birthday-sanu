import { motion } from 'framer-motion';
import { useStage } from '../state/useStage';
import { playChime } from '../engine/audio';
import { content } from '../config/content';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';

export default function Tease() {
  const { nextStage } = useStage();

  const handleContinue = () => {
    playChime();
    nextStage();
  };

  return (
    <motion.div
      className="stage-container"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="flex flex-col items-center gap-6">
        <h2 className="title-text">{content.tease.title}</h2>

        <div className="space-y-4 max-w-sm text-center">
          {content.tease.lines.map((line, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.25, duration: 0.4 }}
              className="subtitle-text text-sm sm:text-base"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.35 }}
          className="pt-2"
        >
          <PrimaryButton onClick={handleContinue} className="px-8 py-3 text-base">
            {content.tease.buttonText}
          </PrimaryButton>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}
