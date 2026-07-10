import { describe, expect, it } from 'vitest';
import { buildTimeline, dodgeOverlaps, packDeliveries, statusOf } from '@/lib/timeline';
import type { Delivery, PhaseId, Task } from '@/lib/types';

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

function delivery(label: string, start: string, end: string): Delivery {
  return { id: label, label, start, end };
}

describe('packDeliveries', () => {
  it('keeps non-overlapping windows on one lane', () => {
    const lanes = packDeliveries([
      delivery('a', '2026-07-01', '2026-07-05'),
      delivery('b', '2026-07-10', '2026-07-14'),
    ]);

    expect(lanes).toHaveLength(1);
    expect(lanes[0]?.map((bar) => bar.delivery.label)).toEqual(['a', 'b']);
  });

  it('pushes an overlapping window onto its own lane', () => {
    const lanes = packDeliveries([
      delivery('a', '2026-07-01', '2026-07-10'),
      delivery('b', '2026-07-05', '2026-07-12'),
    ]);

    expect(lanes).toHaveLength(2);
  });

  it('treats touching windows as overlapping, so the bars do not abut', () => {
    const lanes = packDeliveries([
      delivery('a', '2026-07-01', '2026-07-10'),
      delivery('b', '2026-07-10', '2026-07-14'),
    ]);

    expect(lanes).toHaveLength(2);
  });

  it('packs the real five into three lanes', () => {
    const lanes = packDeliveries([
      delivery('Renovlies', '2026-07-20', '2026-07-30'),
      delivery('X2O', '2026-07-27', '2026-08-01'),
      delivery('Tegels / Vloer', '2026-08-17', '2026-08-24'),
      delivery('Auping bed', '2026-08-24', '2026-08-30'),
      delivery('Kitchen', '2026-08-24', '2026-08-30'),
    ]);

    expect(lanes.map((lane) => lane.map((bar) => bar.delivery.label))).toEqual([
      ['Renovlies', 'Tegels / Vloer'],
      ['X2O', 'Auping bed'],
      ['Kitchen'],
    ]);
  });

  it('sorts by start date regardless of input order', () => {
    const lanes = packDeliveries([
      delivery('late', '2026-08-01', '2026-08-05'),
      delivery('early', '2026-07-01', '2026-07-05'),
    ]);

    expect(lanes[0]?.map((bar) => bar.delivery.label)).toEqual(['early', 'late']);
  });

  it('skips a delivery that is not scheduled yet', () => {
    const lanes = packDeliveries([
      delivery('geen datum', '', ''),
      delivery('half', '2026-07-01', ''),
    ]);

    expect(lanes).toEqual([]);
  });
});

describe('buildTimeline', () => {
  const moments = ['2026-08-24'];

  it('stretches the domain to cover a delivery beyond the last deadline', () => {
    const timeline = buildTimeline(
      [task({ deadline: '2026-07-20' })],
      [],
      [delivery('Kitchen', '2026-08-24', '2026-09-30')],
      TODAY,
    );

    expect(timeline.domain[1].getTime()).toBeGreaterThan(new Date('2026-09-30T00:00').getTime());
  });

  it('keeps only tasks that carry a deadline, and counts the rest', () => {
    const timeline = buildTimeline(
      [task({ deadline: '2026-07-20' }), task(), task()],
      moments,
      [],
      TODAY,
    );

    expect(timeline.datedCount).toBe(1);
    expect(timeline.undatedCount).toBe(2);
  });

  it('omits a phase with no dated task rather than drawing an empty lane', () => {
    const timeline = buildTimeline(
      [task({ phase: 3 as PhaseId, deadline: '2026-07-20' })],
      moments,
      [],
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
      [],
      TODAY,
    );

    expect(timeline.rows[0]?.items.map((item) => item.task.title)).toEqual(['vroeg', 'laat']);
  });

  it('spans from before the earliest mark to after the latest', () => {
    const timeline = buildTimeline([task({ deadline: '2026-07-20' })], moments, [], TODAY);
    const [start, end] = timeline.domain;

    // Today (9 July) is earlier than the only deadline, so it anchors the start.
    expect(start.getTime()).toBeLessThan(TODAY.getTime());
    expect(end.getTime()).toBeGreaterThan(new Date('2026-08-24T00:00').getTime());
  });

  it('still produces a usable domain when nothing is dated', () => {
    const timeline = buildTimeline([task(), task()], [], [], TODAY);
    const [start, end] = timeline.domain;

    expect(timeline.rows).toHaveLength(0);
    expect(timeline.datedCount).toBe(0);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});
