import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStage } from '../../state/useStage';
import { playPop, playChime } from '../../engine/audio';
import { tick, buzzShort } from '../../engine/haptics';
import { spawnSparks, spawnConfetti, spawnHearts } from '../../engine/particles';
import { mic } from '../../engine/mic';
import { content } from '../../config/content';
import PrimaryButton from '../../components/PrimaryButton';
import CakeModel from './CakeModel';
import BlowController from './BlowController';

export default function CakeScene() {
  const { nextStage, setCandlesBlown, setRelightDone } = useStage();

  // Phase: 'firstBlow' | 'wish' | 'relit' | 'done'
  const [phase, setPhase] = useState<'firstBlow' | 'wish' | 'relit' | 'done'>('firstBlow');
  // Array of 5 booleans: false = lit, true = blown out
  const [blown, setBlown] = useState<boolean[]>([false, false, false, false, false]);
  const [blowMeter, setBlowMeter] = useState<number>(0);
  const [blowStrength, setBlowStrength] = useState<number>(0);

  const BLOW_ORDER = [2, 1, 3, 0, 4]; // Middle first, then inner, then outer

  // Clean up mic on stage unmount
  useEffect(() => {
    return () => {
      mic.stop();
    };
  }, []);

  // Update blow meter based on strength reported by BlowController
  useEffect(() => {
    if (phase !== 'firstBlow' && phase !== 'relit') return;

    if (blowStrength > 0.22) {
      setBlowMeter((prev) => Math.min(100, prev + blowStrength * 4.2));
    } else {
      setBlowMeter((prev) => Math.max(0, prev - 1.2));
    }
  }, [blowStrength, phase]);

  // Blow meter triggers candle extinguish sequentially
  useEffect(() => {
    if (phase !== 'firstBlow' && phase !== 'relit') return;

    const currentBlownCount = blown.filter(Boolean).length;
    const threshold = (currentBlownCount + 1) * 20;

    if (blowMeter >= threshold && currentBlownCount < 5) {
      const candleToBlow = BLOW_ORDER[currentBlownCount];
      extinguishCandle(candleToBlow);
    }
  }, [blowMeter, phase, blown]);

  const extinguishCandle = (index: number) => {
    if (blown[index]) return;

    tick();
    playPop();

    const nextBlown = [...blown];
    nextBlown[index] = true;
    setBlown(nextBlown);
    setCandlesBlown(nextBlown.filter(Boolean).length);

    // Candle coordinates in screen space approx
    const candleXs = [0.38, 0.44, 0.50, 0.56, 0.62];
    const cx = window.innerWidth * (candleXs[index] || 0.5);
    const cy = window.innerHeight * 0.36;
    spawnSparks(15, cx, cy);

    // Check if all 5 candles blown out
    if (nextBlown.every(Boolean)) {
      // ── CRITICAL: STOP MIC IMMEDIATELY BEFORE WISH/RELIGHT/CHEER ──
      mic.stop();

      if (phase === 'firstBlow') {
        setPhase('wish');
        buzzShort();
        setBlowMeter(0);
        setBlowStrength(0);

        // Romantic Relight sequence after 2.8s
        setTimeout(() => {
          setPhase('relit');
          setBlown([false, false, false, false, false]);
          setCandlesBlown(0);
          setRelightDone(true);
          playChime();
          spawnSparks(35, window.innerWidth / 2, window.innerHeight * 0.35);
          spawnHearts(10, window.innerWidth / 2, window.innerHeight * 0.35);
        }, 2800);
      } else if (phase === 'relit') {
        setPhase('done');
        buzzShort();
        setBlowMeter(0);
        setBlowStrength(0);
        playChime();
        spawnConfetti(75, window.innerWidth / 2, window.innerHeight * 0.4);
        spawnHearts(16, window.innerWidth / 2, window.innerHeight * 0.45);
      }
    }
  };

  const handleCandleTap = (index: number) => {
    if (!blown[index]) {
      extinguishCandle(index);
    }
  };

  const handleCutCake = () => {
    // Ensure mic is fully stopped
    mic.stop();
    nextStage();
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
          {phase === 'wish'
            ? content.cake.blownMessage
            : phase === 'relit'
            ? '✨ Relit for your secret wish! ✨'
            : phase === 'done'
            ? '🎉 All wishes sent to the stars! 🎂'
            : content.cake.title}
        </h2>

        {/* Subtitle instructions */}
        <p className="subtitle-text text-center text-xs sm:text-sm min-h-[38px] px-2 mb-2">
          {phase === 'wish'
            ? content.cake.blownSub
            : phase === 'relit'
            ? content.cake.subtitles.relitBlow
            : phase === 'done'
            ? 'The candles are blown, the stage is set for the cut! 🔪'
            : blowStrength > 0.25 || blowMeter > 15
            ? content.cake.subtitles.blowing
            : content.cake.subtitles.idle}
        </p>

        {/* Realistic Shared Cake Model Scene */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center select-none my-1">
          <CakeModel
            view="front"
            candles={blown.map((b) => !b)}
            blowStrength={blowStrength}
            onCandleTap={handleCandleTap}
          />
        </div>

        {/* Blow Meter */}
        {(phase === 'firstBlow' || phase === 'relit') && (
          <div className="w-56 h-3 bg-white/10 rounded-full overflow-hidden border border-pink-500/20 my-2 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 transition-all duration-75 rounded-full"
              style={{ width: `${blowMeter}%` }}
            />
          </div>
        )}

        {/* Blow Controls Component (User gesture mic, listening cue, fallback hold) */}
        <BlowController
          phase={phase}
          onStrengthChange={setBlowStrength}
        />

        {/* Continue Button on Cake Completion */}
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-2"
          >
            <PrimaryButton onClick={handleCutCake} className="px-8 py-3 text-base shadow-xl shadow-pink-500/30">
              {content.cake.continueButtonText}
            </PrimaryButton>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
