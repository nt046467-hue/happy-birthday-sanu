import { create } from 'zustand';

/**
 * Typed stage machine for the birthday experience.
 * One stage mounted at a time. No back navigation.
 * AnimatePresence mode="wait" handles transitions.
 */
export const STAGES = [
  'gate',
  'giftBox',
  'tease',
  'nameReveal',
  'cake',
  'cut',
  'memories1',
  'memories2',
  'unwrap',
  'letter',
  'finale',
] as const;

export type Stage = (typeof STAGES)[number];

export type DeviceTier = 'high' | 'mid' | 'low';

interface StageState {
  /** Current active stage */
  stage: Stage;
  /** Device performance tier, detected at gate */
  tier: DeviceTier;
  /** Whether audio context has been unlocked */
  audioUnlocked: boolean;
  /** Number of candles currently blown out (0–5) */
  candlesBlown: number;
  /** Whether the romantic relight has happened */
  relightDone: boolean;
  /** Whether cake cutting is complete */
  cutComplete: boolean;
  /** Prefers reduced motion */
  reducedMotion: boolean;

  // Actions
  setStage: (stage: Stage) => void;
  nextStage: () => void;
  setTier: (tier: DeviceTier) => void;
  setAudioUnlocked: (unlocked: boolean) => void;
  setCandlesBlown: (count: number) => void;
  setRelightDone: (done: boolean) => void;
  setCutComplete: (done: boolean) => void;
  reset: () => void;
}

const getReducedMotion = () =>
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export const useStage = create<StageState>((set, get) => ({
  stage: 'gate',
  tier: 'mid',
  audioUnlocked: false,
  candlesBlown: 0,
  relightDone: false,
  cutComplete: false,
  reducedMotion: getReducedMotion(),

  setStage: (stage) => set({ stage }),

  nextStage: () => {
    const { stage } = get();
    const idx = STAGES.indexOf(stage);
    if (idx < STAGES.length - 1) {
      set({ stage: STAGES[idx + 1] });
    }
  },

  setTier: (tier) => set({ tier }),
  setAudioUnlocked: (audioUnlocked) => set({ audioUnlocked }),
  setCandlesBlown: (candlesBlown) => set({ candlesBlown }),
  setRelightDone: (relightDone) => set({ relightDone }),
  setCutComplete: (cutComplete) => set({ cutComplete }),

  reset: () =>
    set({
      stage: 'gate',
      audioUnlocked: false,
      candlesBlown: 0,
      relightDone: false,
      cutComplete: false,
    }),
}));
