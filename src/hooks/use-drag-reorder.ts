'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMoveTask } from '@/hooks/use-plan';
import type { PointerEvent as ReactPointerEvent } from 'react';

/** A press that never travels this far is a tap, not a drag. */
const SLOP_PX = 6;
/** How long a finger must rest on the handle before the row lifts. */
const HOLD_MS = 180;

export type DragHandlers = {
  dragId: string | null;
  /** Spread onto the grip. The row itself carries `data-task-id`. */
  handleProps: (id: string) => { onPointerDown: (event: ReactPointerEvent) => void };
};

/**
 * Reorder by pointer rather than by the HTML5 drag-and-drop API, which fires no
 * events at all on touch. One implementation now serves mouse and finger.
 *
 * A mouse lifts the row as soon as it moves past the slop; a finger has to hold
 * the grip briefly first, so that a stray graze while scrolling does not reorder
 * the plan. Reordering still goes through `LiveList.move`, so two people dragging
 * at once stays conflict-free.
 */
export function useDragReorder(): DragHandlers {
  const moveTask = useMoveTask();
  const [dragId, setDragId] = useState<string | null>(null);
  // Mutable, because the pointer handlers must not be rebuilt mid-gesture.
  const active = useRef<string | null>(null);
  /**
   * The row the pointer was over last. `pointermove` fires continuously, so
   * without this the swap runs on every pixel and the two rows oscillate back
   * into their original order. The old drag-and-drop code got this for free from
   * `dragenter`, which fires once per row entered.
   */
  const lastTarget = useRef<string | null>(null);

  const finish = useCallback(() => {
    active.current = null;
    lastTarget.current = null;
    setDragId(null);
    document.body.style.removeProperty('user-select');
  }, []);

  useEffect(() => finish, [finish]);

  const onPointerDown = useCallback(
    (id: string, event: ReactPointerEvent) => {
      // Ignore secondary buttons; let the browser keep its context menu.
      if (event.button !== 0) {
        return;
      }

      const startX = event.clientX;
      const startY = event.clientY;
      const isTouch = event.pointerType !== 'mouse';
      let lifted = false;
      let holdTimer: ReturnType<typeof setTimeout> | undefined;

      const lift = () => {
        lifted = true;
        active.current = id;
        lastTarget.current = id;
        setDragId(id);
        document.body.style.setProperty('user-select', 'none');
      };

      if (isTouch) {
        holdTimer = setTimeout(lift, HOLD_MS);
      }

      const onMove = (move: PointerEvent) => {
        const travelled = Math.hypot(move.clientX - startX, move.clientY - startY);

        if (!lifted) {
          if (isTouch) {
            // Moved before the hold elapsed: this is a scroll, not a drag.
            if (travelled > SLOP_PX) {
              cleanup();
            }

            return;
          }

          if (travelled <= SLOP_PX) {
            return;
          }

          lift();
        }

        move.preventDefault();

        const under = document.elementFromPoint(move.clientX, move.clientY);
        const row = under?.closest('[data-task-id]');
        const targetId = row?.getAttribute('data-task-id') ?? null;

        if (!targetId || targetId === lastTarget.current) {
          return;
        }

        lastTarget.current = targetId;

        if (active.current && targetId !== active.current) {
          moveTask(active.current, targetId);
        }
      };

      const cleanup = () => {
        clearTimeout(holdTimer);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', cleanup);
        window.removeEventListener('pointercancel', cleanup);
        finish();
      };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', cleanup);
      window.addEventListener('pointercancel', cleanup);
    },
    [moveTask, finish],
  );

  const handleProps = useCallback(
    (id: string) => ({
      onPointerDown: (event: ReactPointerEvent) => onPointerDown(id, event),
    }),
    [onPointerDown],
  );

  return { dragId, handleProps };
}
