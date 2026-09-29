import { motion } from 'framer-motion';
import { useStage } from '../state/useStage';
import { unlockAudio, playChime } from '../engine/audio';
import { detectTier } from '../engine/perf';
import { setParticleTier, spawnConfetti } from '../engine/particles';
import { content } from '../config/content';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';

export default function Gate() {
  const { nextStage, setTier, setAudioUnlocked } = useStage();

  const handleStart = () => {
    // 1. Unlock Audio
    unlockAudio();
    setAudioUnlocked(true);
    playChime();

    // 2. Detect Performance Tier
    const tier = detectTier();
    setTier(tier);
    setParticleTier(tier);

    // 3. Spawn a celebratory particle burst
    spawnConfetti(25, window.innerWidth / 2, window.innerHeight * 0.4);

    // 4. Proceed to next stage
    nextStage();
  };

  return (
    <motion.div
      className="stage-container"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl select-none"
        >
          ✨💖✨
        </motion.div>

        <div className="space-y-2">
          <h1 className="title-text">{content.gate.title}</h1>
          <p className="subtitle-text">{content.gate.subtitle}</p>
        </div>

        <div className="pt-2">
          <PrimaryButton onClick={handleStart} className="text-lg px-8 py-3.5 shadow-lg shadow-pink-500/20">
            {content.gate.cta}
          </PrimaryButton>
        </div>

        <p className="text-xs text-pink-300/60 font-medium tracking-wide">
          Best experienced with sound on 🎧
        </p>
      </GlassCard>
    </motion.div>
  );
}
