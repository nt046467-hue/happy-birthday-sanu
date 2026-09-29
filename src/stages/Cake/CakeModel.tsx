import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { content } from '../../config/content';

export interface CakeModelProps {
  /** Array of 5 booleans: true = lit, false = blown out */
  candles: boolean[];
  /** Progress of slicing (0 to 1) */
  sliceProgress?: number;
  /** Whether the cut is 100% complete */
  isCutDone?: boolean;
  /** View mode: 'front' for blowing scene, 'cut' for slicing scene */
  view: 'front' | 'cut';
  /** Blow strength (0 to 1) for flame leaning/flicker */
  blowStrength?: number;
  /** Optional click handler for tapping individual candles */
  onCandleTap?: (index: number) => void;
}

export default function CakeModel({
  candles,
  sliceProgress = 0,
  isCutDone = false,
  view = 'front',
  blowStrength = 0,
  onCandleTap,
}: CakeModelProps) {
  const litCount = candles.filter(Boolean).length;
  const anyLit = litCount > 0;
  const isCutView = view === 'cut';

  // Candle specifications: 5 thin, elegant candles
  const candleDefs = useMemo(() => [
    { x: 112, y: 32, w: 5.5, h: 42, tilt: -2.2, color: '#f472b6', stripe: '#ffffff', wickH: 4.5 },
    { x: 130, y: 27, w: 5.5, h: 47, tilt: -1.0, color: '#c084fc', stripe: '#fef08a', wickH: 5.0 },
    { x: 150, y: 23, w: 6.0, h: 51, tilt: 0.0, color: '#fbbf24', stripe: '#fde047', wickH: 5.5, hasDrip: true },
    { x: 170, y: 27, w: 5.5, h: 47, tilt: 1.0, color: '#34d399', stripe: '#ffffff', wickH: 5.0 },
    { x: 188, y: 32, w: 5.5, h: 42, tilt: 2.2, color: '#38bdf8', stripe: '#fbcfe8', wickH: 4.5 },
  ], []);

  // Calculate slice displacement
  const sliceSlideX = isCutDone ? 36 : sliceProgress * 28;
  const sliceSlideY = isCutDone ? -4 : sliceProgress * -2;
  const sliceRotate = isCutDone ? 3.5 : sliceProgress * 2;

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg
        viewBox="0 0 300 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* ── Realistic Vertical 3-Stop Gradients ── */}
          {/* Tier 1: Strawberry Silk Cream */}
          <linearGradient id="cmTier1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb6db" />
            <stop offset="45%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          {/* Tier 2: Blueberry Lavender Velvet */}
          <linearGradient id="cmTier2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#edd8ff" />
            <stop offset="45%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>

          {/* Tier 3: Golden Custard Sponge */}
          <linearGradient id="cmTier3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Side Depth Shadows */}
          <linearGradient id="cmSideShadow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.32)" />
          </linearGradient>

          {/* Specular Left Strip Highlight */}
          <linearGradient id="cmSpecHighlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Thick Vanilla Cream Drips */}
          <linearGradient id="cmCreamDrip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>

          {/* Ceramic Plate */}
          <linearGradient id="cmPlateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fce7f3" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>

          {/* Strawberry Gloss */}
          <radialGradient id="cmBerryGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="55%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>

          {/* Cross Section Texture (Cut wedge) */}
          <linearGradient id="cmSpongeCross" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#fde047" />
            <stop offset="70%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
          <linearGradient id="cmJamLayer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Pre-baked flame glow sprite */}
          <radialGradient id="cmFlameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.9)" />
            <stop offset="40%" stopColor="rgba(251, 146, 60, 0.6)" />
            <stop offset="70%" stopColor="rgba(239, 68, 68, 0.25)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
          </radialGradient>

          {/* Warm pool on icing */}
          <radialGradient id="cmIcingPool" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(254, 240, 138, 0.55)" />
            <stop offset="100%" stopColor="rgba(254, 240, 138, 0)" />
          </radialGradient>

          {/* Cut Clips for splitting the cake */}
          <clipPath id="cmLeftHalfClip">
            <rect x="0" y="0" width="150" height="320" />
          </clipPath>
          <clipPath id="cmRightHalfClip">
            <rect x="150" y="0" width="150" height="320" />
          </clipPath>
        </defs>

        {/* ── TABLECLOTH & AMBIENT FLOOR SHADOW ── */}
        <ellipse cx="150" cy="298" rx="128" ry="14" fill="rgba(10, 0, 15, 0.45)" />
        <ellipse cx="150" cy="296" rx="95" ry="9" fill="rgba(0, 0, 0, 0.5)" />

        {/* ── CERAMIC PLATE ── */}
        <g id="cakePlate">
          <ellipse cx="150" cy="286" rx="122" ry="16" fill="url(#cmPlateGrad)" />
          {/* Inner Plate Well */}
          <ellipse cx="150" cy="284" rx="114" ry="11" fill="rgba(255, 255, 255, 0.35)" />
          <ellipse cx="150" cy="285" rx="112" ry="10" fill="none" stroke="rgba(244, 114, 182, 0.3)" strokeWidth="1.5" />
          {/* Specular Rim Arc */}
          <path
            d="M48 286 Q150 274 252 286"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </g>

        {/* ── SIDE DISH FOR SLICE (Visible in Cut scene when slice lands) ── */}
        {isCutView && isCutDone && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <ellipse cx="236" cy="280" rx="38" ry="9" fill="rgba(0,0,0,0.35)" />
            <ellipse cx="236" cy="276" rx="36" ry="8" fill="url(#cmPlateGrad)" />
            <ellipse cx="236" cy="275" rx="32" ry="5.5" fill="rgba(255,255,255,0.4)" />
          </motion.g>
        )}

        {/* ══════════════════════════════════════════════
            SHARED 3-TIER CAKE BODY (Left Half + Right Half)
        ══════════════════════════════════════════════ */}

        {/* LEFT HALF (Remains stationary) */}
        <g clipPath={isCutView ? 'url(#cmLeftHalfClip)' : undefined}>
          <CakeTiersGroup isCutView={isCutView} anyLit={anyLit} />
        </g>

        {/* RIGHT HALF / SLICE (Slides right during cut) */}
        <motion.g
          clipPath={isCutView ? 'url(#cmRightHalfClip)' : undefined}
          animate={
            isCutView && (sliceProgress > 0 || isCutDone)
              ? { x: sliceSlideX, y: sliceSlideY, rotate: sliceRotate }
              : { x: 0, y: 0, rotate: 0 }
          }
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          style={{ transformOrigin: '150px 280px' }}
        >
          <CakeTiersGroup isCutView={isCutView} anyLit={anyLit} />

          {/* Realistic Cross-Section Layers Exposed on Cut Wedge */}
          {isCutView && (sliceProgress > 0 || isCutDone) && (
            <g id="cutCrossSectionFace">
              {/* Sponge cut plane edge line */}
              <line x1="150" y1="74" x2="150" y2="266" stroke="#fbbf24" strokeWidth="3" />
              {/* Vanilla Cream Layer */}
              <line x1="150" y1="130" x2="150" y2="136" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
              <line x1="150" y1="194" x2="150" y2="200" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
              {/* Strawberry Jam Layer */}
              <line x1="150" y1="133" x2="150" y2="135" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
              <line x1="150" y1="197" x2="150" y2="199" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
            </g>
          )}
        </motion.g>

        {/* ── CAKE LIGHT REACTION OVERLAY ── */}
        {/* Darkens & cools the cake when all candles are blown out */}
        <rect
          x="35"
          y="65"
          width="230"
          height="220"
          rx="20"
          fill="rgba(8, 2, 18, 0.48)"
          className="pointer-events-none transition-opacity duration-1000"
          style={{ opacity: anyLit || isCutView ? 0 : 1 }}
        />

        {/* ══════════════════════════════════════════════
            5 REALISTIC SLENDER CANDLES & DYNAMIC FLAMES
        ══════════════════════════════════════════════ */}
        {!isCutView && (
          <g id="cakeCandlesGroup">
            {candleDefs.map((c, i) => {
              const isLit = candles[i];
              const leanAngle = c.tilt + (blowStrength > 0 ? (blowStrength * 16) : 0);
              const flameScaleY = isLit ? Math.max(0.4, 1 - blowStrength * 0.45) : 0;
              const flameScaleX = isLit ? Math.max(0.5, 1 - blowStrength * 0.25) : 0;

              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onClick={() => onCandleTap?.(i)}
                  style={{ transformOrigin: `${c.x}px ${c.y + c.h}px` }}
                >
                  {/* Warm light pooling on icing around candle base */}
                  <ellipse
                    cx={c.x}
                    cy={c.y + c.h}
                    rx="14"
                    ry="4"
                    fill="url(#cmIcingPool)"
                    className="transition-opacity duration-500 pointer-events-none"
                    style={{ opacity: isLit ? 1 : 0 }}
                  />

                  {/* Slender Candle Body with tilt */}
                  <g transform={`rotate(${c.tilt} ${c.x} ${c.y + c.h})`}>
                    {/* Shadow under candle */}
                    <rect x={c.x - c.w / 2} y={c.y} width={c.w} height={c.h} rx={c.w / 2} fill={c.color} />
                    {/* Specular Wax Highlight along left edge */}
                    <rect x={c.x - c.w / 2} y={c.y} width={c.w * 0.35} height={c.h} rx={1} fill="rgba(255,255,255,0.4)" />
                    {/* Diagonal Spiral Stripes */}
                    <line x1={c.x - c.w / 2} y1={c.y + 8} x2={c.x + c.w / 2} y2={c.y + 4} stroke={c.stripe} strokeWidth="1.4" opacity="0.8" />
                    <line x1={c.x - c.w / 2} y1={c.y + 18} x2={c.x + c.w / 2} y2={c.y + 14} stroke={c.stripe} strokeWidth="1.4" opacity="0.8" />
                    <line x1={c.x - c.w / 2} y1={c.y + 28} x2={c.x + c.w / 2} y2={c.y + 24} stroke={c.stripe} strokeWidth="1.4" opacity="0.8" />
                    <line x1={c.x - c.w / 2} y1={c.y + 38} x2={c.x + c.w / 2} y2={c.y + 34} stroke={c.stripe} strokeWidth="1.4" opacity="0.8" />

                    {/* Wax drip on center candle */}
                    {c.hasDrip && (
                      <path
                        d={`M${c.x + c.w / 2} ${c.y + 14} Q${c.x + c.w / 2 + 3} ${c.y + 19} ${c.x + c.w / 2} ${c.y + 22}`}
                        stroke={c.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}

                    {/* Dark Wick */}
                    <line
                      x1={c.x}
                      y1={c.y}
                      x2={c.x}
                      y2={c.y - c.wickH}
                      stroke="#1e293b"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Dynamic Realistic Teardrop Flame */}
                  {isLit && (
                    <motion.g
                      animate={{
                        scaleY: [flameScaleY, flameScaleY * 1.08, flameScaleY * 0.94, flameScaleY],
                        scaleX: [flameScaleX, flameScaleX * 0.94, flameScaleX * 1.06, flameScaleX],
                        rotate: [leanAngle - 1.5, leanAngle + 1.5, leanAngle - 1, leanAngle],
                      }}
                      transition={{
                        duration: 0.55 + i * 0.08,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ transformOrigin: `${c.x}px ${c.y - c.wickH}px` }}
                    >
                      {/* Pre-rendered Soft Additive Glow Sprite */}
                      <circle
                        cx={c.x}
                        cy={c.y - c.wickH - 12}
                        r="20"
                        fill="url(#cmFlameGlow)"
                        className="pointer-events-none"
                      />

                      {/* Outer Teardrop Flame (Warm Orange) */}
                      <path
                        d={`M${c.x} ${c.y - c.wickH - 24} C${c.x - 7} ${c.y - c.wickH - 14} ${c.x - 6} ${c.y - c.wickH} ${c.x} ${c.y - c.wickH} C${c.x + 6} ${c.y - c.wickH} ${c.x + 7} ${c.y - c.wickH - 14} ${c.x} ${c.y - c.wickH - 24} Z`}
                        fill="#fb923c"
                      />

                      {/* Middle Flame (Vibrant Golden Yellow) */}
                      <path
                        d={`M${c.x} ${c.y - c.wickH - 18} C${c.x - 4.5} ${c.y - c.wickH - 10} ${c.x - 4} ${c.y - c.wickH - 1} ${c.x} ${c.y - c.wickH - 1} C${c.x + 4} ${c.y - c.wickH - 1} ${c.x + 4.5} ${c.y - c.wickH - 10} ${c.x} ${c.y - c.wickH - 18} Z`}
                        fill="#fef08a"
                      />

                      {/* Inner Hot Core (Pure White) */}
                      <ellipse
                        cx={c.x}
                        cy={c.y - c.wickH - 6}
                        rx="2"
                        ry="4.5"
                        fill="#ffffff"
                      />

                      {/* Blue Flame Base (Oxygen rich core at wick) */}
                      <path
                        d={`M${c.x - 2.5} ${c.y - c.wickH} Q${c.x} ${c.y - c.wickH + 1.8} ${c.x + 2.5} ${c.y - c.wickH} Q${c.x} ${c.y - c.wickH - 2.5} ${c.x - 2.5} ${c.y - c.wickH} Z`}
                        fill="#38bdf8"
                        opacity="0.85"
                      />
                    </motion.g>
                  )}
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * 3-Tier Layered Cake Artwork (Sub-component for shared view & split-clipping)
 */
function CakeTiersGroup({ isCutView, anyLit }: { isCutView: boolean; anyLit: boolean }) {
  return (
    <g id="cakeTiers">
      {/* ── TIER 1 (BOTTOM: STRAWBERRY CREAM) ── */}
      <g id="tier1Bottom">
        {/* Tier 1 Body with organic rounded corners */}
        <rect x="45" y="196" width="210" height="70" rx="12" fill="url(#cmTier1)" />
        {/* Contact shadow from middle tier above */}
        <ellipse cx="150" cy="198" rx="82" ry="7" fill="rgba(0,0,0,0.24)" />
        {/* Specular Left Highlight */}
        <rect x="45" y="196" width="45" height="70" rx="10" fill="url(#cmSpecHighlight)" />
        {/* Darker Side Shading Right */}
        <rect x="185" y="196" width="70" height="70" rx="10" fill="url(#cmSideShadow)" />

        {/* Piped Shell Border at base */}
        <g id="tier1PipedBase" fill="#fff" opacity="0.9">
          {[52, 68, 84, 100, 116, 132, 148, 164, 180, 196, 212, 228, 244].map((px, i) => (
            <ellipse key={i} cx={px} cy="264" rx="8.5" ry="4.5" />
          ))}
        </g>

        {/* Thick Vanilla Icing Drips with irregular lengths */}
        <path
          d="M45 204 Q53 226 61 204 Q70 216 78 204 Q90 234 100 204 Q112 218 124 204 Q138 238 150 204 Q162 216 174 204 Q188 232 200 204 Q212 218 222 204 Q234 236 244 204 Q250 214 255 204"
          stroke="url(#cmCreamDrip)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* ── TIER 2 (MIDDLE: LAVENDER VELVET) ── */}
      <g id="tier2Middle">
        <rect x="72" y="132" width="156" height="64" rx="10" fill="url(#cmTier2)" />
        {/* Contact shadow from top tier */}
        <ellipse cx="150" cy="134" rx="56" ry="6" fill="rgba(0,0,0,0.24)" />
        {/* Left Highlight */}
        <rect x="72" y="132" width="38" height="64" rx="8" fill="url(#cmSpecHighlight)" />
        {/* Right Shading */}
        <rect x="168" y="132" width="60" height="64" rx="8" fill="url(#cmSideShadow)" />

        {/* Piped Shell Border at base */}
        <g id="tier2PipedBase" fill="#fff" opacity="0.9">
          {[78, 92, 106, 120, 134, 148, 162, 176, 190, 204, 218].map((px, i) => (
            <ellipse key={i} cx={px} cy="194" rx="7.5" ry="4" />
          ))}
        </g>

        {/* Irregular dripping icing on tier 2 */}
        <path
          d="M72 138 Q82 158 92 138 Q104 168 116 138 Q128 154 138 138 Q150 172 162 138 Q174 156 186 138 Q198 166 210 138 Q220 152 228 138"
          stroke="url(#cmCreamDrip)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Fondant Nameplate with "Karu" */}
        <g id="fondantNameplate">
          {/* Inset drop shadow so it looks pressed into the frosting */}
          <rect x="114" y="152" width="72" height="26" rx="13" fill="rgba(0,0,0,0.22)" />
          {/* Plaque Body */}
          <rect x="115" y="151" width="70" height="26" rx="13" fill="#ffffff" />
          <rect x="117" y="153" width="66" height="22" rx="11" fill="none" stroke="#f472b6" strokeWidth="1" strokeDasharray="3 2" />
          {/* Name text */}
          <text
            x="150"
            y="168"
            textAnchor="middle"
            fill="#db2777"
            fontSize="14.5"
            fontWeight="bold"
            fontFamily="'Great Vibes', cursive"
          >
            {content.cake.plaqueText}
          </text>
        </g>
      </g>

      {/* ── TIER 3 (TOP: CUSTARD GOLD SPONGE) ── */}
      <g id="tier3Top">
        <rect x="98" y="74" width="104" height="58" rx="9" fill="url(#cmTier3)" />
        {/* Left highlight */}
        <rect x="98" y="74" width="28" height="58" rx="8" fill="url(#cmSpecHighlight)" />
        {/* Right shading */}
        <rect x="162" y="74" width="40" height="58" rx="8" fill="url(#cmSideShadow)" />

        {/* Warm rim light on top tier when candles lit */}
        {anyLit && !isCutView && (
          <ellipse cx="150" cy="74" rx="52" ry="5" fill="rgba(254, 240, 138, 0.45)" />
        )}

        {/* Piped Shell Border at base */}
        <g id="tier3PipedBase" fill="#fff" opacity="0.9">
          {[104, 116, 128, 140, 152, 164, 176, 188, 196].map((px, i) => (
            <ellipse key={i} cx={px} cy="130" rx="6.5" ry="3.5" />
          ))}
        </g>

        {/* Top lip frosting ripples */}
        <path
          d="M98 78 Q108 92 118 78 Q128 98 138 78 Q150 94 162 78 Q174 96 186 78 Q195 90 202 78"
          stroke="url(#cmCreamDrip)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Fine Sprinkles on top tier */}
        <g id="fineSprinkles" opacity="0.85">
          <rect x="108" y="86" width="3" height="1.2" rx="0.6" fill="#f472b6" transform="rotate(35 108 86)" />
          <rect x="122" y="92" width="3" height="1.2" rx="0.6" fill="#38bdf8" transform="rotate(-25 122 92)" />
          <rect x="136" y="84" width="3" height="1.2" rx="0.6" fill="#34d399" transform="rotate(55 136 84)" />
          <rect x="168" y="88" width="3" height="1.2" rx="0.6" fill="#fbbf24" transform="rotate(15 168 88)" />
          <rect x="184" y="92" width="3" height="1.2" rx="0.6" fill="#f472b6" transform="rotate(-40 184 92)" />
          <rect x="145" y="96" width="3" height="1.2" rx="0.6" fill="#c084fc" transform="rotate(70 145 96)" />
        </g>

        {/* Cream Rosettes & 3 Glossy Strawberries on Top */}
        <g id="topDecorations">
          {/* Whipped Cream Rosettes */}
          <circle cx="106" cy="74" r="5" fill="#fff" />
          <circle cx="132" cy="73" r="5" fill="#fff" />
          <circle cx="168" cy="73" r="5" fill="#fff" />
          <circle cx="194" cy="74" r="5" fill="#fff" />

          {/* Strawberry 1 (Left) */}
          <g transform="translate(118, 68)">
            <ellipse cx="0" cy="0" rx="5.5" ry="7" fill="url(#cmBerryGrad)" transform="rotate(-12)" />
            <circle cx="-1.5" cy="-2" r="1.2" fill="#fff" opacity="0.75" />
            <path d="M-3 -6 L0 -4 L3 -6 L1 -3 L-1 -3 Z" fill="#16a34a" />
          </g>

          {/* Strawberry 2 (Center) */}
          <g transform="translate(150, 65)">
            <ellipse cx="0" cy="0" rx="6" ry="7.5" fill="url(#cmBerryGrad)" />
            <circle cx="-1.8" cy="-2.2" r="1.3" fill="#fff" opacity="0.8" />
            <path d="M-3.5 -6.5 L0 -4.5 L3.5 -6.5 L1 -3.2 L-1 -3.2 Z" fill="#16a34a" />
          </g>

          {/* Strawberry 3 (Right) */}
          <g transform="translate(182, 68)">
            <ellipse cx="0" cy="0" rx="5.5" ry="7" fill="url(#cmBerryGrad)" transform="rotate(12)" />
            <circle cx="-1.2" cy="-2" r="1.2" fill="#fff" opacity="0.75" />
            <path d="M-3 -6 L0 -4 L3 -6 L1 -3 L-1 -3 Z" fill="#16a34a" />
          </g>
        </g>
      </g>
    </g>
  );
}
