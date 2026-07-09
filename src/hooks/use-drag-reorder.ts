'use client';

import { useState } from 'react';
import { useMoveTask } from '@/hooks/use-plan';

export type DragHandlers = {
  dragId: string | null;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
};

/**
 * Reordering as the pointer crosses a neighbour, rather than on drop, is what
 * made the original planner feel immediate. `LiveList.move` keeps it safe when
 * two people drag at once.
 */
export function useDragReorder(): DragHandlers {
  const moveTask = useMoveTask();
  const [dragId, setDragId] = useState<string | null>(null);

  return {
    dragId,
    onDragStart: setDragId,
    onDragEnter: (targetId) => {
      if (dragId && dragId !== targetId) {
        moveTask(dragId, targetId);
      }
    },
    onDragEnd: () => setDragId(null),
  };
}
