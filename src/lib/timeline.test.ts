import { describe, expect, it } from 'vitest';
import { buildTimeline, dodgeOverlaps, statusOf } from '@/lib/timeline';
import type { PhaseId, Task } from '@/lib/types';

const TODAY = new Date('2026-07-09T00:00:00');

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: Math.random().toString(36).slice(2),
    phase: 1 as PhaseId,
    title: 'Taak',
    who: [],
    deadline: '',
    done: false,
    doneBy: '',
    ...overrides,
  };
}

describe('statusOf', () => {
  it('calls a finished task done, however late it was', () => {
    expect(statusOf(task({ deadline: '2020-01-01', done: true }), TODAY)).toBe('done');
  });

  it('calls an unfinished past deadline overdue', () => {
    expect(statusOf(task({ deadline: '2026-07-08' }), TODAY)).toBe('overdue');
  });

  it('calls a future deadline open', () => {
    expect(statusOf(task({ deadline: '2026-07-10' }), TODAY)).toBe('open');
  });

  it('calls today open, not overdue', () => {
    expect(statusOf(task({ deadline: '2026-07-09' }), TODAY)).toBe('open');
  });
});

describe('dodgeOverlaps', () => {
  it('leaves well-separated marks on the centre line', () => {
    expect(dodgeOverlaps([0, 40, 80], 14)).toEqual([0, 0, 0]);
  });

  it('grows a cluster outward from the centre', () => {
    expect(dodgeOverlaps([0, 2, 4, 6], 14)).toEqual([0, 1, -1, 2]);
  });

  it('resets the cluster once a gap reappears', () => {
    expect(dodgeOverlaps([0, 2, 100, 102], 14)).toEqual([0, 1, 0, 1]);
  });

  it('handles an empty list', () => {
    expect(dodgeOverlaps([], 14)).toEqual([]);
  });
});

describe('buildTimeline', () => {
  const moments = ['2026-08-24'];

  it('keeps only tasks that carry a deadline, and counts the rest', () => {
    const timeline = buildTimeline(
      [task({ deadline: '2026-07-20' }), task(), task()],
      moments,
      TODAY,
    );

    expect(timeline.datedCount).toBe(1);
    expect(timeline.undatedCount).toBe(2);
  });

  it('omits a phase with no dated task rather than drawing an empty lane', () => {
    const timeline = buildTimeline(
      [task({ phase: 3 as PhaseId, deadline: '2026-07-20' })],
      moments,
      TODAY,
    );

    expect(timeline.rows).toHaveLength(1);
    expect(timeline.rows[0]?.phase.id).toBe(3);
  });

  it('sorts a lane chronologically', () => {
    const timeline = buildTimeline(
      [
        task({ title: 'laat', deadline: '2026-08-01' }),
        task({ title: 'vroeg', deadline: '2026-07-15' }),
      ],
      moments,
      TODAY,
    );

    expect(timeline.rows[0]?.items.map((item) => item.task.title)).toEqual(['vroeg', 'laat']);
  });

  it('spans from before the earliest mark to after the latest', () => {
    const timeline = buildTimeline([task({ deadline: '2026-07-20' })], moments, TODAY);
    const [start, end] = timeline.domain;

    // Today (9 July) is earlier than the only deadline, so it anchors the start.
    expect(start.getTime()).toBeLessThan(TODAY.getTime());
    expect(end.getTime()).toBeGreaterThan(new Date('2026-08-24T00:00').getTime());
  });

  it('still produces a usable domain when nothing is dated', () => {
    const timeline = buildTimeline([task(), task()], [], TODAY);
    const [start, end] = timeline.domain;

    expect(timeline.rows).toHaveLength(0);
    expect(timeline.datedCount).toBe(0);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});
