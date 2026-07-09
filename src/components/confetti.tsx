'use client';

import { CONFETTI_COLORS } from '@/lib/plan-config';
import type { CSSProperties } from 'react';

const PIECES = 48;

export type ConfettiPiece = CSSProperties;

/**
 * Built in the event handler that fires the confetti, never during render —
 * `Math.random` in a render body produces a different scatter on every re-render.
 */
export function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: PIECES }, (_, index) => ({
    position: 'absolute',
    left: `${Math.random() * 100}%`,
    top: `${-5 - Math.random() * 15}vh`,
    width: 8 + Math.random() * 8,
    height: 10 + Math.random() * 8,
    background: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    animation: `vp-conf ${1.2 + Math.random() * 0.9}s ease-in forwards`,
    animationDelay: `${Math.random() * 0.3}s`,
    opacity: 0,
  }));
}

/** Plain CSS animations: 48 springs would cost far more than this is worth. */
export function Confetti({ pieces }: { pieces: readonly ConfettiPiece[] }) {
  if (pieces.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      {pieces.map((piece, index) => (
        <div key={index} style={piece} />
      ))}
    </div>
  );
}
