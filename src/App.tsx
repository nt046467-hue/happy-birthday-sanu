import { useEffect, useRef, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStage } from './state/useStage';
import { initParticleCanvas, destroyParticleCanvas, setParticleTier } from './engine/particles';
import { registerLoop, unregisterLoop } from './engine/loop';
import { fpsTick, checkDowngrade } from './engine/perf';

import StarField from './components/StarField';
import RoomLight from './components/RoomLight';
import Vignette from './components/Vignette';

import Gate from './stages/Gate';
import GiftBox from './stages/GiftBox';
import Tease from './stages/Tease';
import NameReveal from './stages/NameReveal';
import CakeScene from './stages/Cake/CakeScene';
import CutScene from './stages/Cut/CutScene';
import Memories from './stages/Memories';
import Unwrap from './stages/Unwrap';
import Letter from './stages/Letter';
import Finale from './stages/Finale';

export default function App() {
  const stage = useStage((s) => s.stage);
  const tier = useStage((s) => s.tier);
  const setTier = useStage((s) => s.setTier);
  const candlesBlown = useStage((s) => s.candlesBlown);
  const relightDone = useStage((s) => s.relightDone);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize and bind canvas particle system
  useEffect(() => {
    if (canvasRef.current) {
      initParticleCanvas(canvasRef.current, tier);
    }
    return () => {
      destroyParticleCanvas();
    };
  }, []);

  // Update particle tier on change
  useEffect(() => {
    setParticleTier(tier);
  }, [tier]);

  // Performance FPS monitoring loop with auto-downgrade
  useEffect(() => {
    registerLoop('perf-monitor', () => {
      fpsTick(performance.now());
      const lowerTier = checkDowngrade(tier);
      if (lowerTier) {
        setTier(lowerTier);
      }
    });

    return () => {
      unregisterLoop('perf-monitor');
    };
  }, [tier, setTier]);

  // Dynamic RoomLight mode based on stage and candle status
  const roomLightMode = useMemo(() => {
    if (stage === 'cake') {
      if (candlesBlown >= 5) {
        return relightDone ? 'dark' : 'dim';
      }
      return 'warm';
    }
    if (stage === 'cut') {
      return 'warm';
    }
    return 'warm';
  }, [stage, candlesBlown, relightDone]);

  // Render current stage
  const renderStage = () => {
    switch (stage) {
      case 'gate':
        return <Gate key="gate" />;
      case 'giftBox':
        return <GiftBox key="giftBox" />;
      case 'tease':
        return <Tease key="tease" />;
      case 'nameReveal':
        return <NameReveal key="nameReveal" />;
      case 'cake':
        return <CakeScene key="cake" />;
      case 'cut':
        return <CutScene key="cut" />;
      case 'memories1':
      case 'memories2':
        return <Memories key={stage} />;
      case 'unwrap':
        return <Unwrap key="unwrap" />;
      case 'letter':
        return <Letter key="letter" />;
      case 'finale':
        return <Finale key="finale" />;
      default:
        return <Gate key="gate" />;
    }
  };

  return (
    <main className="relative w-full h-full overflow-hidden select-none">
      {/* Background Star field */}
      <StarField />

      {/* Atmospheric dynamic Room lighting */}
      <RoomLight mode={roomLightMode} />

      {/* Cinematic Edge Vignette */}
      <Vignette />

      {/* Canvas particle overlay */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Main active stage with AnimatePresence transitions */}
      <AnimatePresence mode="wait">
        {renderStage()}
      </AnimatePresence>
    </main>
  );
}
