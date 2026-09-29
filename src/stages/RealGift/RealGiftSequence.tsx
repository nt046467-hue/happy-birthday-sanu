import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStage } from '../../state/useStage';
import { duckMusic, playSoftThud, playRibbonRustle, playChime } from '../../engine/audio';
import { spawnConfetti, spawnHearts, spawnSparks } from '../../engine/particles';
import { buzzShort, buzzMedium } from '../../engine/haptics';
import GiftArrival from './GiftArrival';
import EnvelopeReveal from './EnvelopeReveal';
import LetterScroll from './LetterScroll';
import { content } from '../../config/content';

type Phase =
  | 'hush'
  | 'arrival'
  | 'tap'
  | 'unwrap'
  | 'envelope'
  | 'open'
  | 'letter'
  | 'celebrate';

export default function RealGiftSequence() {
  const { nextStage } = useStage();
  const [phase, setPhase] = useState<Phase>('hush');
  const [overlayDim, setOverlayDim] = useState(true);

  useEffect(() => {
    duckMusic(0.7, 1200);
    const t1 = setTimeout(() => setPhase('arrival'), 1200);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (phase === 'arrival') {
      const t = setTimeout(() => {
        playSoftThud();
        buzzShort();
        setPhase('tap');
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleTap = useCallback(() => {
    if (phase !== 'tap') return;
    setPhase('unwrap');
    buzzMedium();
    playRibbonRustle();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.42;
    spawnSparks(30, cx, cy);
    spawnConfetti(50, cx, cy);
    setTimeout(() => {
      setPhase('envelope');
      setOverlayDim(false);
      duckMusic(0.3, 2000);
    }, 900);
  }, [phase]);

  const handleOpenEnvelope = useCallback(() => {
    if (phase !== 'envelope') return;
    setPhase('open');
    playRibbonRustle();
    buzzShort();
    setTimeout(() => setPhase('letter'), 600);
  }, [phase]);

  const handleLetterDone = useCallback(() => {
    setPhase('celebrate');
    playChime();
    buzzMedium();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.5;
    spawnConfetti(80, cx, cy);
    spawnHearts(20, cx, cy);
    spawnSparks(25, cx, cy);
    setTimeout(() => spawnHearts(12), 700);
    setTimeout(() => spawnConfetti(40, cx * 0.3, cy), 900);
    setTimeout(() => spawnConfetti(40, cx * 1.7, cy), 1100);
    setTimeout(() => nextStage(), 2200);
  }, [nextStage]);

  return (
    <motion.div
      className="stage-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {overlayDim && (
          <motion.div
            key="dim-overlay"
            className="fixed inset-0 z-10 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'hush' && (
          <motion.div
            key="hush-line"
            className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <p className="text-center font-serif italic text-pink-200/90 text-xl sm:text-2xl px-8 tracking-wide select-none">
              One more thing, Karu…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === 'arrival' || phase === 'tap' || phase === 'unwrap') && (
          <motion.div
            key="gift-arrival"
            className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GiftArrival phase={phase} onTap={handleTap} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === 'envelope' || phase === 'open') && (
          <motion.div
            key="envelope"
            className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <EnvelopeReveal phase={phase} onOpen={handleOpenEnvelope} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'letter' && (
          <motion.div
            key="letter"
            className="fixed inset-0 z-20 flex flex-col items-center justify-start pt-10 pb-6 px-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LetterScroll onDone={handleLetterDone} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'celebrate' && (
          <motion.div
            key="celebrate"
            className="fixed inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-black/40"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl select-none"
            >
              💖
            </motion.div>
            <p className="title-text text-2xl text-center px-8">
              Happy Birthday, Karu! 🎂✨
            </p>
            <p className="subtitle-text text-sm text-center px-6">
              {content.finale.body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
