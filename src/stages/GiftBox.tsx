import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStage } from '../state/useStage';
import { playPop, playChime } from '../engine/audio';
import { buzzShort } from '../engine/haptics';
import { spawnConfetti, spawnHearts, spawnSparks } from '../engine/particles';
import { content } from '../config/content';
import GlassCard from '../components/GlassCard';

export default function GiftBox() {
  const { nextStage } = useStage();
  const [opened, setOpened] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const handleTap = () => {
    if (opened) return;
    setOpened(true);
    buzzShort();
    playPop();

    // Calculate exact box center coordinate
    let boxX = window.innerWidth / 2;
    let boxY = window.innerHeight * 0.42;

    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      boxX = rect.left + rect.width / 2;
      boxY = rect.top + rect.height * 0.35;
    }

    // Erupt particles UPWARDS from the box opening!
    spawnConfetti(70, boxX, boxY);
    spawnHearts(16, boxX, boxY);
    spawnSparks(35, boxX, boxY);

    setTimeout(() => {
      playChime();
    }, 400);

    // Auto advance smoothly after opening animation
    setTimeout(() => {
      nextStage();
    }, 1400);
  };

  return (
    <motion.div
      className="stage-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="flex flex-col items-center">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 mb-3 rounded-full text-xs font-bold tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm">
          {/* Real SVG sparkle icon */}
          <svg className="w-3.5 h-3.5 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
          <span>{content.giftBox.badge.replace(/^✨\s*/, '')}</span>
        </div>

        {/* Real 3D Sculpted Gift Box Scene */}
        <div
          ref={boxRef}
          className="relative w-56 h-60 flex items-center justify-center my-2 cursor-pointer select-none"
          onClick={handleTap}
        >
          {/* Floating Real SVG decorative icons */}
          <motion.div
            animate={{ y: [-4, 4, -4], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 left-5 pointer-events-none"
          >
            <svg className="w-5 h-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
            </svg>
          </motion.div>

          <motion.div
            animate={{ y: [4, -4, 4], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="absolute top-6 right-5 pointer-events-none"
          >
            <svg className="w-4 h-4 text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>

          <motion.div
            animate={{ y: [-3, 3, -3], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute bottom-8 left-3 pointer-events-none"
          >
            <svg className="w-3.5 h-3.5 text-purple-300 drop-shadow-[0_0_6px_rgba(192,132,252,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
            </svg>
          </motion.div>

          <motion.div
            animate={{ y: [3, -3, 3], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
            className="absolute bottom-10 right-4 pointer-events-none"
          >
            <svg className="w-4 h-4 text-amber-200 drop-shadow-[0_0_6px_rgba(254,243,199,0.7)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </motion.div>

          {/* Realistic SVG Gift Box */}
          <motion.svg
            viewBox="0 0 240 250"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible"
            animate={
              opened
                ? { scale: [1, 1.05, 0.98] }
                : { scale: [1, 1.02, 1], y: [0, -3, 0] }
            }
            transition={
              opened
                ? { duration: 0.5, ease: 'easeOut' }
                : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <defs>
              {/* Rich 3D Satin Pink Box Body */}
              <linearGradient id="realBoxBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="35%" stopColor="#ec4899" />
                <stop offset="75%" stopColor="#be185d" />
                <stop offset="100%" stopColor="#831843" />
              </linearGradient>

              {/* Front Right Shading */}
              <linearGradient id="realBoxShadowRight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
              </linearGradient>

              {/* Specular Satin Sheen */}
              <linearGradient id="realSatinSheen" x1="0" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.45" />
                <stop offset="30%" stopColor="white" stopOpacity="0.12" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>

              {/* Lid Rich Gradient */}
              <linearGradient id="realLidGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbcfe8" />
                <stop offset="40%" stopColor="#f472b6" />
                <stop offset="85%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#9d174d" />
              </linearGradient>

              {/* Metallic Golden Silk Ribbon */}
              <linearGradient id="goldRibbonH" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="25%" stopColor="#fde047" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="75%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>

              <linearGradient id="goldRibbonV" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ca8a04" />
                <stop offset="30%" stopColor="#fef08a" />
                <stop offset="55%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>

              {/* Bow Left Loop */}
              <linearGradient id="bowLoopL" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="40%" stopColor="#fde047" />
                <stop offset="80%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>

              {/* Bow Right Loop */}
              <linearGradient id="bowLoopR" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="40%" stopColor="#fde047" />
                <stop offset="80%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>

              {/* Ribbon Cast Shadow */}
              <linearGradient id="ribbonShadow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(0,0,0,0.25)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>

              {/* Ambient Floor Shadow */}
              <radialGradient id="floorOcclusion" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
                <stop offset="60%" stopColor="rgba(0,0,0,0.25)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>

            {/* Realistic Multi-Layer Floor Shadows */}
            <ellipse cx="120" cy="235" rx="88" ry="12" fill="url(#floorOcclusion)" />
            <ellipse cx="120" cy="233" rx="65" ry="7" fill="rgba(0,0,0,0.4)" />

            {/* Box Body */}
            <g id="boxMainBody">
              {/* Main Box Outer Container */}
              <rect x="36" y="125" width="168" height="102" rx="10" fill="url(#realBoxBody)" />
              {/* Right depth shading */}
              <rect x="156" y="125" width="48" height="102" rx="0" fill="url(#realBoxShadowRight)" style={{ borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }} />
              {/* Top satin sheen gloss */}
              <rect x="36" y="125" width="168" height="40" rx="8" fill="url(#realSatinSheen)" />

              {/* Inner Box Glow when opened */}
              {opened && (
                <rect x="42" y="128" width="156" height="24" rx="6" fill="#fef08a" opacity="0.9" filter="drop-shadow(0 0 16px rgba(251, 191, 36, 1))" />
              )}

              {/* Vertical Ribbon Shadow under ribbon */}
              <rect x="100" y="125" width="8" height="102" fill="url(#ribbonShadow)" />
              {/* Vertical Gold Ribbon */}
              <rect x="108" y="125" width="24" height="102" fill="url(#goldRibbonV)" />
              {/* Ribbon Specular Highlight Thread */}
              <line x1="114" y1="125" x2="114" y2="227" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
              <line x1="126" y1="125" x2="126" y2="227" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
            </g>

            {/* 3D Animated Lid & Bow Assembly */}
            <motion.g
              id="boxLidAndBow"
              animate={
                opened
                  ? { y: -58, rotate: -18, x: -10, opacity: 0.9 }
                  : { y: 0, rotate: 0, x: 0 }
              }
              transition={{ type: 'spring', stiffness: 320, damping: 16 }}
              style={{ transformOrigin: '30px 115px' }}
            >
              {/* Lid Contact Shadow on Box */}
              <ellipse cx="120" cy="126" rx="86" ry="6" fill="rgba(0,0,0,0.3)" />

              {/* Lid Main Body */}
              <rect x="28" y="105" width="184" height="26" rx="8" fill="url(#realLidGrad)" />
              {/* Lid Edge Bevel Specular */}
              <rect x="28" y="105" width="184" height="6" rx="4" fill="rgba(255,255,255,0.45)" />
              {/* Lid Bottom Underside Shadow */}
              <rect x="28" y="126" width="184" height="5" rx="2" fill="rgba(100,0,30,0.35)" />

              {/* Horizontal Gold Ribbon on Lid */}
              <rect x="28" y="109" width="184" height="16" fill="url(#goldRibbonH)" opacity="0.95" />
              <line x1="28" y1="112" x2="212" y2="112" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />

              {/* Vertical Gold Ribbon piece on Lid */}
              <rect x="108" y="105" width="24" height="26" fill="url(#goldRibbonV)" />

              {/* 3D Sculpted Ribbon Bow */}
              <g id="sculptedBow">
                {/* Left Tail with angled cut */}
                <path d="M120 102 C108 106 82 118 72 138 C86 142 108 126 120 110 Z" fill="url(#bowLoopL)" opacity="0.95" />
                <path d="M120 102 C112 108 92 120 84 136 C92 138 106 126 116 114 Z" fill="rgba(255,255,255,0.2)" />

                {/* Right Tail with angled cut */}
                <path d="M120 102 C132 106 158 118 168 138 C154 142 132 126 120 110 Z" fill="url(#bowLoopR)" opacity="0.95" />
                <path d="M120 102 C128 108 148 120 156 136 C148 138 134 126 124 114 Z" fill="rgba(255,255,255,0.2)" />

                {/* Left Big Loop */}
                <path d="M120 95 C104 68 54 50 48 72 C42 92 95 102 120 95 Z" fill="url(#bowLoopL)" />
                {/* Left Loop Inside Fold & Depth */}
                <path d="M120 95 C108 76 68 62 60 76 C58 86 96 97 120 95 Z" fill="rgba(255,255,255,0.3)" />
                <path d="M64 74 C60 84 78 88 94 88 C76 86 66 80 64 74 Z" fill="rgba(110,60,0,0.35)" />

                {/* Right Big Loop */}
                <path d="M120 95 C136 68 186 50 192 72 C198 92 145 102 120 95 Z" fill="url(#bowLoopR)" />
                {/* Right Loop Inside Fold & Depth */}
                <path d="M120 95 C132 76 172 62 180 76 C182 86 144 97 120 95 Z" fill="rgba(255,255,255,0.3)" />
                <path d="M176 74 C180 84 162 88 146 88 C164 86 174 80 176 74 Z" fill="rgba(110,60,0,0.35)" />

                {/* Center Knot (Spherical 3D cushion) */}
                <ellipse cx="120" cy="98" rx="13" ry="11" fill="#eab308" />
                <ellipse cx="120" cy="97" rx="11" ry="8" fill="#fde047" />
                <ellipse cx="117" cy="95" rx="5" ry="3.5" fill="white" opacity="0.8" />
              </g>
            </motion.g>
          </motion.svg>
        </div>

        {/* Content text */}
        <h2 className="title-text mt-2 text-2xl sm:text-3xl">{content.giftBox.title}</h2>
        <p className="subtitle-text mt-2 whitespace-pre-line text-xs sm:text-sm max-w-xs">
          {content.giftBox.subtitle}
        </p>

        {/* Tap hint */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-4 text-xs font-bold text-amber-300 tracking-wider uppercase cursor-pointer flex items-center gap-1.5"
          onClick={handleTap}
        >
          <span>👇</span>
          <span>{content.giftBox.hint.replace(/^👇\s*|\s*👇$/g, '')}</span>
          <span>👇</span>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}
