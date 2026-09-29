import { motion } from 'framer-motion';

interface Props {
  phase: 'arrival' | 'tap' | 'unwrap';
  onTap: () => void;
}

/**
 * A real wrapped gift box SVG that springs in from top,
 * bounces on landing, and cracks open on tap.
 */
export default function GiftArrival({ phase, onTap }: Props) {
  const isUnwrapping = phase === 'unwrap';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Gift box spring animation */}
      <motion.div
        initial={{ y: -320, opacity: 0 }}
        animate={{
          y: isUnwrapping ? -80 : 0,
          opacity: isUnwrapping ? 0 : 1,
          scale: isUnwrapping ? 1.15 : 1,
          rotate: isUnwrapping ? [0, -8, 10, -6, 0] : 0,
        }}
        transition={
          isUnwrapping
            ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
            : {
                y: { type: 'spring', stiffness: 280, damping: 18, mass: 1.1 },
                opacity: { duration: 0.3 },
              }
        }
        onClick={onTap}
        className="cursor-pointer select-none"
        style={{ touchAction: 'manipulation' }}
      >
        <GiftBoxSVG tapping={phase === 'tap'} />
      </motion.div>

      {/* Contact shadow that grows on landing */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: isUnwrapping ? 0 : 1,
          opacity: isUnwrapping ? 0 : 0.35,
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.05 }}
        className="w-36 h-3 rounded-full bg-black/60 blur-md -mt-8"
        style={{ transformOrigin: 'center' }}
      />

      {/* Tap prompt */}
      {phase === 'tap' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-col items-center gap-1 mt-4 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-2xl"
          >
            👆
          </motion.div>
          <p className="subtitle-text text-center text-sm px-6 tracking-wide">
            Tap to open your gift, Karu 💖
          </p>
        </motion.div>
      )}
    </div>
  );
}

function GiftBoxSVG({ tapping }: { tapping: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 180 200"
      width="180"
      height="200"
      animate={tapping ? { scale: [1, 0.96, 1.02, 1] } : {}}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Drop shadow filter */}
      <defs>
        <filter id="gift-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#b844f4" floodOpacity="0.35" />
        </filter>
        <linearGradient id="box-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="box-side" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a21caf" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="lid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="ribbon-v" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="ribbon-h" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      <g filter="url(#gift-shadow)">
        {/* Box body */}
        <rect x="15" y="90" width="150" height="100" rx="4" fill="url(#box-grad)" />
        {/* Box side shading */}
        <rect x="135" y="92" width="28" height="97" rx="4" fill="url(#box-side)" opacity="0.55" />
        {/* Lid top face */}
        <rect x="10" y="68" width="160" height="28" rx="4" fill="url(#lid-grad)" />
        {/* Lid side shading */}
        <rect x="140" y="69" width="28" height="27" rx="4" fill="#6d28d9" opacity="0.45" />

        {/* Vertical ribbon on box body */}
        <rect x="79" y="90" width="22" height="100" fill="url(#ribbon-v)" opacity="0.9" />
        {/* Vertical ribbon on lid */}
        <rect x="79" y="68" width="22" height="28" fill="url(#ribbon-v)" opacity="0.9" />
        {/* Horizontal ribbon on box body */}
        <rect x="15" y="122" width="150" height="18" fill="url(#ribbon-h)" opacity="0.9" />
        {/* Horizontal ribbon on lid */}
        <rect x="10" y="74" width="160" height="12" fill="url(#ribbon-h)" opacity="0.9" />

        {/* Ribbon bow — left loop */}
        <ellipse cx="70" cy="62" rx="22" ry="13" fill="#fde68a" transform="rotate(-20 70 62)" />
        <ellipse cx="70" cy="62" rx="14" ry="7" fill="#fbbf24" opacity="0.6" transform="rotate(-20 70 62)" />
        {/* Ribbon bow — right loop */}
        <ellipse cx="110" cy="62" rx="22" ry="13" fill="#fde68a" transform="rotate(20 110 62)" />
        <ellipse cx="110" cy="62" rx="14" ry="7" fill="#fbbf24" opacity="0.6" transform="rotate(20 110 62)" />
        {/* Bow knot center */}
        <ellipse cx="90" cy="66" rx="10" ry="8" fill="#fbbf24" />
        <ellipse cx="90" cy="66" rx="6" ry="5" fill="#fde68a" />

        {/* Bow tails */}
        <path d="M84 72 Q75 90 68 96" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M96 72 Q105 90 112 96" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Small stars/dots decoration on box */}
        <circle cx="40" cy="115" r="3" fill="white" opacity="0.35" />
        <circle cx="145" cy="110" r="2.5" fill="white" opacity="0.3" />
        <circle cx="55" cy="155" r="2" fill="white" opacity="0.25" />
        <circle cx="140" cy="150" r="3" fill="white" opacity="0.25" />

        {/* 4-point star decoration */}
        <path d="M35 140 L37 134 L39 140 L45 142 L39 144 L37 150 L35 144 L29 142Z" fill="white" opacity="0.4" />
        <path d="M128 168 L130 163 L132 168 L137 170 L132 172 L130 177 L128 172 L123 170Z" fill="white" opacity="0.3" />
      </g>
    </motion.svg>
  );
}
