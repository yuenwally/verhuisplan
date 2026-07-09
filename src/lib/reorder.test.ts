import { describe, expect, it } from 'vitest';
import { moveWithinPhase } from '@/lib/reorder';
import type { PhaseId } from '@/lib/types';

const tasks = [
  { id: 'a', phase: 1 as PhaseId },
  { id: 'b', phase: 1 as PhaseId },
  { id: 'c', phase: 2 as PhaseId },
];

describe('moveWithinPhase', () => {
  it('maps a drag onto a neighbour to move indices', () => {
    expect(moveWithinPhase(tasks, 'b', 'a')).toEqual({ from: 1, to: 0 });
  });

  it('refuses to move across a phase boundary', () => {
    expect(moveWithinPhase(tasks, 'a', 'c')).toBeNull();
  });

  it('ignores a drag onto itself', () => {
    expect(moveWithinPhase(tasks, 'a', 'a')).toBeNull();
  });

  it('ignores an id that is no longer in the list', () => {
    expect(moveWithinPhase(tasks, 'gone', 'a')).toBeNull();
    expect(moveWithinPhase(tasks, 'a', 'gone')).toBeNull();
  });
});
