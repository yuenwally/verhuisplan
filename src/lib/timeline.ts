import { isOverdue, startOfToday } from '@/lib/format';
import { PHASES } from '@/lib/plan-config';
import type { PhaseDef } from '@/lib/plan-config';
import type { Task } from '@/lib/types';

/**
 * Status is encoded by shape as well as colour. Red-green colourblind readers
 * cannot separate `overdue` from `done` on hue alone, so every mark also differs
 * in fill and glyph. See `TIMELINE_STATUS` in plan-config for the validated hues.
 */
export type TimelineStatus = 'done' | 'overdue' | 'open';

export type TimelineItem = {
  task: Task;
  /** Midnight on the task's deadline. */
  date: Date;
  status: TimelineStatus;
  /** Lanes dodge overlapping marks; 0 sits on the lane's centre line. */
  dodge: number;
};

export type TimelineRow = {
  phase: PhaseDef;
  items: TimelineItem[];
};

export type Timeline = {
  rows: TimelineRow[];
  domain: [Date, Date];
  datedCount: number;
  undatedCount: number;
};

export function statusOf(task: Task, today: Date): TimelineStatus {
  if (task.done) {
    return 'done';
  }

  return isOverdue(task.deadline, task.done, today) ? 'overdue' : 'open';
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00`);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

/**
 * Marks closer together than `minGap` pixels would overlap, so they alternate
 * above and below the lane's centre line. Returns the dodge index per item, in
 * the order given.
 */
export function dodgeOverlaps(
  xs: readonly number[],
  minGap: number,
): number[] {
  const dodges: number[] = [];
  let run = 0;

  for (let i = 0; i < xs.length; i++) {
    const previous = xs[i - 1];
    const current = xs[i];

    if (i === 0 || previous === undefined || current === undefined) {
      run = 0;
    } else if (current - previous < minGap) {
      run += 1;
    } else {
      run = 0;
    }

    // 0, +1, -1, +2, -2 … so a cluster grows outward from the centre line.
    const magnitude = Math.ceil(run / 2);

    if (magnitude === 0) {
      dodges.push(0);
    } else {
      dodges.push(run % 2 === 1 ? magnitude : -magnitude);
    }
  }

  return dodges;
}

/**
 * Builds the timeline from the tasks that carry a deadline. Phases with no dated
 * task get no lane: an empty lane says "nothing planned here" when the truth is
 * "nothing dated here", and the undated count carries that instead.
 */
export function buildTimeline(
  tasks: readonly Task[],
  momentDates: readonly string[],
  today: Date = startOfToday(),
): Timeline {
  const dated = tasks.filter((task) => task.deadline);
  const undatedCount = tasks.length - dated.length;

  const rows: TimelineRow[] = [];

  for (const phase of PHASES) {
    const items = dated
      .filter((task) => task.phase === phase.id)
      .map((task) => ({
        task,
        date: parseDate(task.deadline),
        status: statusOf(task, today),
        dodge: 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (items.length > 0) {
      rows.push({ phase, items });
    }
  }

  const stamps = [
    ...dated.map((task) => parseDate(task.deadline).getTime()),
    ...momentDates.map((date) => parseDate(date).getTime()),
    today.getTime(),
  ];

  // With nothing dated the domain still has to be a real interval, or the scale
  // collapses and every mark lands on the same pixel.
  const min = stamps.length ? Math.min(...stamps) : today.getTime();
  const max = stamps.length ? Math.max(...stamps) : today.getTime();

  return {
    rows,
    domain: [addDays(new Date(min), -4), addDays(new Date(max), 4)],
    datedCount: dated.length,
    undatedCount,
  };
}
