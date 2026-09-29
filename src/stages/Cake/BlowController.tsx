import { useState, useEffect, useRef } from 'react';
import { mic, getMicDebugInfo } from '../../engine/mic';

interface BlowControllerProps {
  phase: 'firstBlow' | 'wish' | 'relit' | 'done';
  onStrengthChange: (strength: number) => void;
  disabled?: boolean;
}

export default function BlowController({
  phase,
  onStrengthChange,
  disabled = false,
}: BlowControllerProps) {
  const [micActive, setMicActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{ active: boolean; trackState?: string }>({
    active: false,
    trackState: 'none',
  });

  const animFrameRef = useRef<number | null>(null);

  // Poll blow strength while active or holding
  useEffect(() => {
    const loop = () => {
      let strength = 0;
      if (micActive) {
        strength = mic.getStrength();
      }
      if (isHolding) {
        strength = Math.max(strength, 0.85);
      }

      onStrengthChange(strength);

      if (import.meta.env.DEV) {
        setDebugInfo(getMicDebugInfo());
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [micActive, isHolding, onStrengthChange]);

  // Clean up mic on unmount or when transitioning away from blow phases
  useEffect(() => {
    if (phase === 'wish' || phase === 'done') {
      mic.stop();
      setMicActive(false);
    }

    return () => {
      mic.stop();
      setMicActive(false);
    };
  }, [phase]);

  // Handle explicit user gesture to activate mic
  const handleEnableMic = async () => {
    if (micActive || isStarting || disabled) return;
    setIsStarting(true);
    const ok = await mic.start();
    setIsStarting(false);
    setMicActive(ok);
  };

  const isBlowPhase = phase === 'firstBlow' || phase === 'relit';

  if (!isBlowPhase) return null;

  return (
    <div className="flex flex-col items-center gap-2.5 my-1">
      <div className="flex items-center gap-2">
        {/* Real User Gesture Mic Button */}
        {!micActive ? (
          <button
            onClick={handleEnableMic}
            disabled={isStarting || disabled}
            className="btn-primary select-none px-5 py-2 text-xs sm:text-sm shadow-md shadow-pink-500/20 active:scale-95 flex items-center gap-1.5"
          >
            <span>💨</span>
            <span>{isStarting ? 'Connecting Mic...' : 'Use Microphone to Blow'}</span>
          </button>
        ) : (
          /* Honest Unobtrusive Listening Dot */
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">Listening for breath 💨</span>
          </div>
        )}

        {/* Fallback Manual Hold-to-blow Button */}
        <button
          onMouseDown={() => setIsHolding(true)}
          onMouseUp={() => setIsHolding(false)}
          onTouchStart={() => setIsHolding(true)}
          onTouchEnd={() => setIsHolding(false)}
          className={`select-none px-4 py-2 text-xs sm:text-sm rounded-full font-bold transition-transform ${
            isHolding
              ? 'bg-amber-400 text-black scale-95 shadow-inner'
              : 'btn-secondary text-pink-300'
          }`}
        >
          {isHolding ? '🔥 Blowing...' : 'Hold to Blow'}
        </button>
      </div>

      {/* Dev-only honest debug line */}
      {import.meta.env.DEV && (
        <div className="text-[10px] text-pink-300/40 tracking-wider font-mono">
          [DEV Mic: {debugInfo.active ? 'ACTIVE' : 'STOPPED'} | track: {debugInfo.trackState}]
        </div>
      )}
    </div>
  );
}
