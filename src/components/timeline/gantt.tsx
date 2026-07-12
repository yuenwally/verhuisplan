'use client';

import { motion } from 'motion/react';
import {
  MONTHS,
  StatusDot,
  TIMELINE_DELIVERY,
  flatDeliveries,
  formatDayShort,
} from '@/components/timeline/shared';
import type { Timeline } from '@/lib/timeline';

/** Where a date lands across the track, 0 at the domain start, 1 at its end. */
function fractionOf(date: Date, domain: [Date, Date]): number {
  const span = domain[1].getTime() - domain[0].getTime();

  if (span <= 0) {
    return 0;
  }

  const raw = (date.getTime() - domain[0].getTime()) / span;

  return Math.min(Math.max(raw, 0), 1);
}

/** First-of-month dates within the domain, for the vertical gridlines. */
function monthLines(domain: [Date, Date]): Date[] {
  const lines: Date[] = [];
  const cursor = new Date(domain[0].getFullYear(), domain[0].getMonth(), 1);

  if (cursor < domain[0]) {
    cursor.setMonth(cursor.getMonth() + 1);
  }

  while (cursor <= domain[1]) {
    lines.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return lines;
}

type Row =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'delivery'; key: string; label: string; start: Date; end: Date }
  | {
    kind: 'task';
    key: string;
    label: string;
    date: Date;
    status: Parameters<typeof StatusDot>[0]['status'];
  };

export function GanttDesign({ timeline, today }: { timeline: Timeline; today: Date }) {
  const domain = timeline.domain;
  const deliveries = flatDeliveries(timeline);
  const months = monthLines(domain);

  const rows: Row[] = [];

  if (deliveries.length > 0) {
    rows.push({ kind: 'header', key: 'h-lev', label: 'Leveringen' });
    for (const bar of deliveries) {
      rows.push({
        kind: 'delivery',
        key: bar.delivery.id,
        label: bar.delivery.label,
        start: bar.start,
        end: bar.end,
      });
    }
  }

  for (const row of timeline.rows) {
    rows.push({ kind: 'header', key: `h-${row.phase.id}`, label: row.phase.shortTitle });
    for (const item of row.items) {
      rows.push({
        kind: 'task',
        key: item.task.id,
        label: item.task.title,
        date: item.date,
        status: item.status,
      });
    }
  }

  const todayLeft = `${fractionOf(today, domain) * 100}%`;

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      {/* Wide enough that a full month reads; the labels ride the track, so the
          chart no longer needs a label column sized to the longest title. */}
      <div className="min-w-[720px]">
        <div className="relative mb-1 h-4">
          {months.map((month) => (
            <span
              key={month.getTime()}
              className="absolute text-[11px] font-bold text-[#8A785C]"
              style={{ left: `${fractionOf(month, domain) * 100}%` }}
            >
              {MONTHS[month.getMonth()]}
            </span>
          ))}
        </div>

        <div className="relative">
          {/* Month gridlines and the today rule, behind every row. */}
          <div className="pointer-events-none absolute inset-0">
            {months.map((month) => (
              <div
                key={month.getTime()}
                className="absolute top-0 bottom-0 w-px bg-border"
                style={{ left: `${fractionOf(month, domain) * 100}%` }}
              />
            ))}
            <div className="absolute top-0 bottom-0 w-[2px] bg-primary" style={{ left: todayLeft }} />
          </div>

          {rows.map((row) => {
            if (row.kind === 'header') {
              return (
                <div
                  key={row.key}
                  className="relative flex h-[26px] items-end pb-0.5 text-[12px] font-extrabold
                    text-foreground"
                >
                  <span className="bg-card/85 pr-2">{row.label}</span>
                </div>
              );
            }

            if (row.kind === 'delivery') {
              const left = fractionOf(row.start, domain) * 100;
              const span = fractionOf(row.end, domain) - fractionOf(row.start, domain);
              const width = Math.max(span * 100, 1.5);

              return (
                <div key={row.key} className="relative h-[30px]">
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0.6 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-1/2 flex h-[16px] -translate-y-1/2 items-center rounded-full
                      px-2 text-[10px] font-bold whitespace-nowrap text-white"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: TIMELINE_DELIVERY,
                      transformOrigin: 'left',
                    }}
                  >
                    <span className="truncate">{row.label}</span>
                  </motion.div>
                </div>
              );
            }

            const x = fractionOf(row.date, domain) * 100;
            // Past the middle a right-running label would overflow, so it hangs to
            // the left of its dot instead.
            const flip = x > 56;

            return (
              <div key={row.key} className="relative h-[30px]">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#EFE6D0]" />

                <div
                  className="absolute top-1/2 flex items-center gap-1.5 whitespace-nowrap"
                  style={{
                    left: `${x}%`,
                    transform: flip ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
                    paddingLeft: flip ? 0 : 14,
                    paddingRight: flip ? 14 : 0,
                  }}
                >
                  <span className="text-[12px] font-semibold text-[#5A4A34]">{row.label}</span>
                  <span className="text-[10px] font-bold text-[#8A785C]">
                    {formatDayShort(row.date)}
                  </span>
                </div>

                {/* The outer div owns the centring transform; motion animates
                    only scale/opacity, which would otherwise overwrite it and
                    leave the dot hanging half a mark below the label. `flex`
                    collapses the SVG's inline descender so the centres meet. */}
                <div
                  className="absolute top-1/2 flex"
                  style={{ left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="flex"
                  >
                    <StatusDot status={row.status} size={15} />
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
