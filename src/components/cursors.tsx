'use client';

import { useOthers, useUpdateMyPresence } from '@liveblocks/react/suspense';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { AvatarGlyph } from '@/components/avatar-glyph';
import type { RefObject } from 'react';

/**
 * Tracks the local pointer within `containerRef` and paints everyone else's.
 *
 * Coordinates are stored relative to the container rather than the viewport, so
 * a cursor lands on the same task for both people even when one has scrolled.
 */
export function Cursors({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    // Liveblocks throttles presence updates, so an unthrottled listener is fine.
    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();

      updateMyPresence({
        cursor: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      });
    };

    // Leaving the container, not merely the document — otherwise a cursor parked
    // in the browser chrome keeps pointing at whatever it last hovered.
    const onPointerLeave = () => updateMyPresence({ cursor: null });

    window.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [containerRef, updateMyPresence]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {others.map(({ connectionId, presence, info }) => {
          if (!presence.cursor) {
            return null;
          }

          return (
            <motion.div
              key={connectionId}
              className="absolute top-0 left-0"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: presence.cursor.x,
                y: presence.cursor.y,
              }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{
                x: { type: 'spring', stiffness: 700, damping: 40, mass: 0.4 },
                y: { type: 'spring', stiffness: 700, damping: 40, mass: 0.4 },
                opacity: { duration: 0.15 },
                scale: { duration: 0.15 },
              }}
            >
              <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
                <path
                  d="M2 2 L2 20.2 L6.9 15.7 L10.1 23.4 L13.3 22 L10.1 14.4 L17 14.4 Z"
                  fill={info.color}
                  stroke="#FDF8EE"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <div
                className="mt-0.5 ml-4 flex w-max items-center gap-1.5 rounded-full px-2.5 py-1
                  text-xs font-extrabold whitespace-nowrap text-white shadow-sm"
                style={{ background: info.color }}
              >
                <AvatarGlyph avatar={info.avatar} className="size-[14px] text-xs" />
                {info.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
