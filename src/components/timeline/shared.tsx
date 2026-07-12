import { AvatarGlyph } from '@/components/avatar-glyph';
import { normalizeWho } from '@/lib/assignees';
import { formatDeadlineShort } from '@/lib/format';
import { avatarFor } from '@/lib/identity';
import { MOMENTS, PHASES, TIMELINE_DELIVERY, TIMELINE_STATUS } from '@/lib/plan-config';
import type { PhaseDef } from '@/lib/plan-config';
import type { DeliveryBar, Timeline, TimelineStatus } from '@/lib/timeline';
import type { Task } from '@/lib/types';

export const STATUS_LABEL: Record<TimelineStatus, string> = {
  done: 'Klaar',
  overdue: 'Te laat',
  open: 'Open',
};

export const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** Monday-first, so a week reads left to right the way the calendar draws it. */
export const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

/** `jul '26`, not `jul 26`, which reads as the 26th of July. */
export function formatTick(value: Date): string {
  return `${MONTHS[value.getMonth()] ?? ''} '${value.getFullYear() % 100}`;
}

/**
 * A shape as well as a colour per status. Red-green colourblind readers cannot
 * separate `overdue` from `done` on hue alone, so `done` carries a tick, `overdue`
 * an exclamation, and `open` is a hollow ring making no colour claim at all. Kept
 * as an SVG `<g>` so it drops into both the visx canvas and a standalone dot.
 */
export function MarkShape({ status }: { status: TimelineStatus }) {
  const color = TIMELINE_STATUS[status];

  if (status === 'open') {
    return <circle r={7} fill="var(--card)" stroke={color} strokeWidth={2.5} />;
  }

  return (
    <>
      <circle r={7} fill={color} stroke="var(--card)" strokeWidth={2} />
      {status === 'done' ? (
        <path
          d="M -3 0 L -1 2.4 L 3.2 -2.4"
          fill="none"
          stroke="var(--card)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M 0 -3.4 L 0 1 M 0 2.8 L 0 3.4"
          stroke="var(--card)"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      )}
    </>
  );
}

/** The mark as a standalone inline dot, for the HTML-based designs. */
export function StatusDot({ status, size = 15 }: { status: TimelineStatus; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-8 -8 16 16" aria-hidden className="shrink-0">
      <MarkShape status={status} />
    </svg>
  );
}

export function Legend({ hasDeliveries }: { hasDeliveries: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[12.5px] font-bold text-[#8A785C]">
      {(['open', 'done', 'overdue'] as const).map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <StatusDot status={status} size={16} />
          {STATUS_LABEL[status]}
        </span>
      ))}
      {hasDeliveries ? (
        <span className="flex items-center gap-1.5">
          <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
            <rect x="0" y="2" width="18" height="8" rx="4" fill={TIMELINE_DELIVERY} />
          </svg>
          Levering
        </span>
      ) : null}
    </div>
  );
}

/** One task pinned to a day, carried with the phase it belongs to. */
export type FlatTask = {
  task: Task;
  date: Date;
  status: TimelineStatus;
  phase: PhaseDef;
};

/** Every dated task, flattened out of the phase rows and sorted by day. */
export function flatTasks(timeline: Timeline): FlatTask[] {
  return timeline.rows
    .flatMap((row) => row.items.map((item) => ({ ...item, phase: row.phase })))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Every scheduled delivery, out of its packing lanes and sorted by start. */
export function flatDeliveries(timeline: Timeline): DeliveryBar[] {
  return timeline.deliveryLanes.flat().sort((a, b) => a.start.getTime() - b.start.getTime());
}

export type MomentPin = { emoji: string; label: string; date: Date };

export function momentPins(): MomentPin[] {
  return MOMENTS.map((moment) => ({
    emoji: moment.emoji,
    label: moment.label,
    date: new Date(`${moment.date}T00:00`),
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function phaseById(id: PhaseDef['id']): PhaseDef | undefined {
  return PHASES.find((phase) => phase.id === id);
}

// --- date helpers, all working in local time on midnight-stamped dates ---

/** `YYYY-MM-DD` in local time, the key two dates on the same day share. */
export function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  next.setHours(0, 0, 0, 0);

  return next;
}

export function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** The Monday on or before `date`; the calendar and week designs start there. */
export function startOfWeek(date: Date): Date {
  // getDay() is 0 for Sunday; shift so Monday is 0.
  const shift = (date.getDay() + 6) % 7;

  return addDays(date, -shift);
}

/** Every Monday-anchored week the domain touches, as arrays of 7 days. */
export function weeksIn(domain: [Date, Date]): Date[][] {
  const weeks: Date[][] = [];
  let cursor = startOfWeek(domain[0]);

  while (cursor <= domain[1]) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)));
    cursor = addDays(cursor, 7);
  }

  return weeks;
}

/** `di 21 jul`, the header a single day gets in the agenda. */
export function formatDayLong(date: Date): string {
  return `${WEEKDAYS[(date.getDay() + 6) % 7]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** `20 jul`, a bare day for chips and week headers. */
export function formatDayShort(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** A delivery's window as `20 jul t/m 30 jul`. */
export function deliveryWhen(bar: DeliveryBar): string {
  return `${formatDeadlineShort(bar.delivery.start)} t/m ${formatDeadlineShort(bar.delivery.end)}`;
}

/** A row of assignee avatars, shared by the chip-based designs. */
export function WhoAvatars({ who }: { who: string[] }) {
  const names = normalizeWho(who);

  if (names.length === 0) {
    return null;
  }

  return (
    <span className="flex items-center -space-x-1">
      {names.map((name) => (
        <AvatarGlyph
          key={name}
          avatar={avatarFor(name)}
          className="size-[15px] rounded-full text-[12px] ring-1 ring-card"
        />
      ))}
    </span>
  );
}

export { TIMELINE_DELIVERY, TIMELINE_STATUS };
