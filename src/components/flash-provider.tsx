'use client';

import { useBroadcastEvent, useEventListener, useSelf } from '@liveblocks/react/suspense';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

const FLASH_MS = 700;

type FlashContextValue = {
  /** Row id → the colour of whoever last touched it, while the pulse lasts. */
  flashes: Readonly<Record<string, string>>;
  /** Tell everyone else that this row just changed under our hands. */
  flash: (targetId: string) => void;
};

const FlashContext = createContext<FlashContextValue>({ flashes: {}, flash: () => {} });

export function FlashProvider({ children }: { children: ReactNode }) {
  const [flashes, setFlashes] = useState<Record<string, string>>({});
  const broadcast = useBroadcastEvent();
  const self = useSelf();
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const show = useCallback((targetId: string, color: string) => {
    setFlashes((previous) => ({ ...previous, [targetId]: color }));

    const existing = timers.current.get(targetId);

    if (existing) {
      clearTimeout(existing);
    }

    timers.current.set(
      targetId,
      setTimeout(() => {
        timers.current.delete(targetId);
        setFlashes((previous) => {
          const next = { ...previous };
          delete next[targetId];

          return next;
        });
      }, FLASH_MS),
    );
  }, []);

  useEventListener(({ event }) => {
    if (event.type === 'flash') {
      show(event.targetId, event.color);
    }
  });

  useEffect(() => {
    const pending = timers.current;

    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  // Broadcast never echoes to the sender, which is what we want: you already
  // know what you just did.
  const flash = useCallback(
    (targetId: string) => broadcast({ type: 'flash', targetId, color: self.info.color }),
    [broadcast, self.info.color],
  );

  const value = useMemo(() => ({ flashes, flash }), [flashes, flash]);

  return <FlashContext.Provider value={value}>{children}</FlashContext.Provider>;
}

export function useFlash() {
  return useContext(FlashContext);
}
