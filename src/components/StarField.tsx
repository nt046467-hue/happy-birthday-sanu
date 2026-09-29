import { useEffect, useRef, useMemo } from 'react';
import { useStage } from '../state/useStage';

/**
 * Starfield background. Pure CSS stars (transform/opacity only).
 * Capped at 55 on mobile, 0 on reduced motion.
 */
export default function StarField() {
  const reducedMotion = useStage((s) => s.reducedMotion);
  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 700 || /Mobi|Android/i.test(navigator.userAgent));
  const count = reducedMotion ? 0 : isMobile ? 45 : 100;

  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = Math.random() * 2.5 + 0.5;
      return {
        key: i,
        size,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: `${(Math.random() * 3 + 1.5).toFixed(1)}s`,
        delay: `${(Math.random() * 4).toFixed(1)}s`,
      };
    });
  }, [count]);

  useEffect(() => {
    // Stars are pure CSS, no JS animation needed
  }, []);

  return (
    <div ref={containerRef} className="star-field" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.key}
          className="star"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            // @ts-expect-error CSS custom property
            '--d': s.duration,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
