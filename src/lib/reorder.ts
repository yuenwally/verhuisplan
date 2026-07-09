import type { PhaseId } from '@/lib/types';

type Orderable = {
  id: string;
  phase: PhaseId;
};

/**
 * Maps a drag from one task onto another into indices for `LiveList.move`.
 *
 * Returns null when the move is a no-op or would cross a phase boundary — tasks
 * only reorder within their own phase, as in the original planner.
 */
export function moveWithinPhase(
  tasks: readonly Orderable[],
  dragId: string,
  targetId: string,
): { from: number; to: number } | null {
  if (dragId === targetId) {
    return null;
  }

  const from = tasks.findIndex((task) => task.id === dragId);
  const to = tasks.findIndex((task) => task.id === targetId);

  if (from < 0 || to < 0) {
    return null;
  }

  if (tasks[from]?.phase !== tasks[to]?.phase) {
    return null;
  }

  return { from, to };
}
