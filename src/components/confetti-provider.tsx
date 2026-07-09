'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Confetti, makeConfetti } from '@/components/confetti';
import type { ConfettiPiece } from '@/components/confetti';
import type { ReactNode } from 'react';

const DURATION_MS = 2200;
const NO_PIECES: readonly ConfettiPiece[] = [];

const ConfettiContext = createContext<{ celebrate: () => void }>({ celebrate: () => {} });

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [pieces, setPieces] = useState<readonly ConfettiPiece[]>(NO_PIECES);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const celebrate = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    setPieces(makeConfetti());

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => setPieces(NO_PIECES), DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }, []);

  const value = useMemo(() => ({ celebrate }), [celebrate]);

  return (
    <ConfettiContext.Provider value={value}>
      {children}
      <Confetti pieces={pieces} />
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  return useContext(ConfettiContext);
}
