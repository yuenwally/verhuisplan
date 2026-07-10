'use client';

import { AxisBottom } from '@visx/axis';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleTime } from '@visx/scale';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { AvatarGlyph } from '@/components/avatar-glyph';
import { normalizeWho } from '@/lib/assignees';
import { formatDeadlineShort, startOfToday } from '@/lib/format';
import { avatarFor } from '@/lib/identity';
import { MOMENTS, TIMELINE_DELIVERY, TIMELINE_STATUS } from '@/lib/plan-config';
import { buildTimeline, dodgeOverlaps } from '@/lib/timeline';
import type { TimelineStatus } from '@/lib/timeline';
import type { Delivery, Task } from '@/lib/types';

const MARGIN = { top: 44, right: 22, bottom: 34, left: 118 };
const ROW_HEIGHT = 52;
const DELIVERY_LANE_HEIGHT = 26;
const DELIVERY_BAR_HEIGHT = 18;
/** Gap between the delivery block and the phase lanes below it. */
const DELIVERY_GAP = 16;
/** Rough advance width of the bar label, to decide whether it fits inside. */
const CHAR_WIDTH = 6.2;
const MARK_RADIUS = 7;
const DODGE_STEP = 15;
/** Two marks nearer than this on the x axis would overlap, so they dodge. */
const MIN_GAP = 2 * MARK_RADIUS + 4;

const STATUS_LABEL: Record<TimelineStatus, string> = {
  done: 'Klaar',
  overdue: 'Te laat',
  open: 'Open',
};

const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** `jul '26`, not `jul 26`, which reads as the 26th of July. */
function formatTick(value: Date): string {
  return `${MONTHS[value.getMonth()] ?? ''} '${value.getFullYear() % 100}`;
}

/**
 * One tick per month boundary. Left to pick its own ticks, a time scale over a
 * few months lands on week starts, and a month-granular label then prints
 * "jul 26" three times in a row.
 */
function monthTicks([start, end]: [Date, Date]): Date[] {
  const ticks: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  if (cursor < start) {
    cursor.setMonth(cursor.getMonth() + 1);
  }

  while (cursor <= end) {
    ticks.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return ticks;
}

const LEAD_TICK_DAYS = 12;

/**
 * A domain starting mid-month has no boundary to label, leaving its first weeks
 * anonymous. When the first boundary is far enough away to not crowd it, the
 * domain's own start earns a tick naming the month it falls in.
 */
function axisTicks(domain: [Date, Date]): Date[] {
  const months = monthTicks(domain);
  const first = months[0];
  const gapDays = first ? (first.getTime() - domain[0].getTime()) / 86_400_000 : Infinity;

  return gapDays > LEAD_TICK_DAYS ? [domain[0], ...months] : months;
}

/**
 * A mark carries its status twice: in hue, and in fill and glyph. Colour alone
 * would collapse for a red-green colourblind reader, for whom `done` and
 * `overdue` sit only ΔE 13 apart.
 */
function Mark({ status }: { status: TimelineStatus }) {
  const color = TIMELINE_STATUS[status];

  if (status === 'open') {
    return <circle r={MARK_RADIUS} fill="var(--card)" stroke={color} strokeWidth={2.5} />;
  }

  return (
    <>
      <circle r={MARK_RADIUS} fill={color} stroke="var(--card)" strokeWidth={2} />
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

function Legend({ hasDeliveries }: { hasDeliveries: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[12.5px] font-bold text-[#8A785C]">
      {(['open', 'done', 'overdue'] as const).map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden>
            <Mark status={status} />
          </svg>
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

type TooltipState = {
  x: number;
  y: number;
  title: string;
  when: string;
  status?: TimelineStatus;
  who?: string[];
};

type ChartProps = {
  tasks: readonly Task[];
  deliveries: readonly Delivery[];
  width: number;
};

function Chart({ tasks, deliveries, width }: ChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const today = startOfToday();
  const momentDates = MOMENTS.map((moment) => moment.date);
  const timeline = buildTimeline(tasks, momentDates, deliveries, today);

  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 120);
  const laneCount = timeline.deliveryLanes.length;
  const deliveryHeight = laneCount > 0 ? laneCount * DELIVERY_LANE_HEIGHT + DELIVERY_GAP : 0;
  const innerHeight = deliveryHeight + timeline.rows.length * ROW_HEIGHT;
  const height = innerHeight + MARGIN.top + MARGIN.bottom;

  const xScale = scaleTime({ domain: timeline.domain, range: [0, innerWidth] });
  const x = (date: Date) => xScale(date) ?? 0;

  // Moments falling on the same day share one rule; their labels stack.
  const momentsByDate = new Map<string, (typeof MOMENTS)[number][]>();

  for (const moment of MOMENTS) {
    const existing = momentsByDate.get(moment.date) ?? [];
    momentsByDate.set(moment.date, [...existing, moment]);
  }

  return (
    <div className="relative">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Tijdlijn van leveringen en taken met datum"
      >
        <Group left={MARGIN.left} top={MARGIN.top}>
          {/* Lane bands, so a row can be followed across the full width. */}
          {timeline.rows.map((row, index) => (
            <rect
              key={row.phase.id}
              x={-8}
              y={deliveryHeight + index * ROW_HEIGHT}
              width={innerWidth + 16}
              height={ROW_HEIGHT}
              rx={8}
              fill={index % 2 === 0 ? 'transparent' : 'rgba(234, 220, 190, 0.35)'}
            />
          ))}

          {[...momentsByDate.entries()].map(([date, moments]) => {
            const left = x(new Date(`${date}T00:00`));
            // Near the right edge the label would run off the canvas, so it
            // hangs to the left of its own rule instead.
            const flip = left > innerWidth - 170;

            return (
              <Group key={date} left={left}>
                <line
                  y1={-MARGIN.top + 12}
                  y2={innerHeight}
                  stroke="#C9B48C"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                {moments.map((moment, index) => (
                  <text
                    key={moment.label}
                    y={-MARGIN.top + 24 + index * 13}
                    x={flip ? -4 : 4}
                    textAnchor={flip ? 'end' : 'start'}
                    fontSize={11}
                    fontWeight={800}
                    fill="#8A785C"
                  >
                    {moment.emoji} {moment.label}
                  </text>
                ))}
              </Group>
            );
          })}

          <Group left={x(today)}>
            <line y1={-6} y2={innerHeight} stroke="var(--primary)" strokeWidth={2} />
            <text y={-10} fontSize={11} fontWeight={800} fill="var(--primary)" textAnchor="middle">
              vandaag
            </text>
          </Group>

          {laneCount > 0 ? (
            <Group>
              <text
                x={-MARGIN.left + 8}
                y={DELIVERY_BAR_HEIGHT}
                fontSize={12.5}
                fontWeight={800}
                fill="var(--foreground)"
              >
                Leveringen
              </text>

              {timeline.deliveryLanes.flatMap((lane, laneIndex) =>
                lane.map((bar) => {
                  const left = x(bar.start);
                  const right = x(bar.end);
                  // A same-day window would otherwise be a zero-width rectangle.
                  const barWidth = Math.max(right - left, 6);
                  const top = laneIndex * DELIVERY_LANE_HEIGHT;
                  const label = bar.delivery.label;
                  const labelWidth = label.length * CHAR_WIDTH;
                  const fitsInside = barWidth > labelWidth + 14;
                  // Outside the bar the label goes right, unless that would run
                  // off the canvas, in which case it goes left.
                  const fitsRight = left + barWidth + 6 + labelWidth < innerWidth;
                  const when = `${formatDeadlineShort(bar.delivery.start)} t/m ${formatDeadlineShort(bar.delivery.end)}`;

                  let labelX = left + 8;
                  let labelAnchor: 'start' | 'end' = 'start';

                  if (!fitsInside && fitsRight) {
                    labelX = left + barWidth + 6;
                  } else if (!fitsInside) {
                    labelX = left - 6;
                    labelAnchor = 'end';
                  }

                  return (
                    <motion.g
                      key={bar.delivery.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setTooltip({
                          x: MARGIN.left + left + barWidth / 2,
                          y: MARGIN.top + top + DELIVERY_BAR_HEIGHT / 2,
                          title: label,
                          when,
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <rect
                        x={left}
                        y={top}
                        width={barWidth}
                        height={DELIVERY_BAR_HEIGHT}
                        rx={5}
                        fill={TIMELINE_DELIVERY}
                        stroke="var(--card)"
                        strokeWidth={2}
                      />
                      <text
                        x={labelX}
                        y={top + DELIVERY_BAR_HEIGHT / 2 + 3.6}
                        textAnchor={labelAnchor}
                        fontSize={10.5}
                        fontWeight={800}
                        fill={fitsInside ? 'var(--card)' : '#6E5C42'}
                      >
                        {label}
                      </text>
                    </motion.g>
                  );
                }),
              )}

              {/* A rule separating deliveries from the phase lanes. With no lanes
                  below it, it would sit just above the axis and read as a second one. */}
              {timeline.rows.length > 0 ? (
                <line
                  x1={-8}
                  x2={innerWidth + 8}
                  y1={deliveryHeight - DELIVERY_GAP / 2}
                  y2={deliveryHeight - DELIVERY_GAP / 2}
                  stroke="#E4D4B2"
                  strokeWidth={1.5}
                />
              ) : null}
            </Group>
          ) : null}

          {timeline.rows.map((row, rowIndex) => {
            const centre = deliveryHeight + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
            const dodges = dodgeOverlaps(
              row.items.map((item) => x(item.date)),
              MIN_GAP,
            );

            return (
              <Group key={row.phase.id}>
                <text
                  x={-MARGIN.left + 8}
                  y={centre + 4}
                  fontSize={12.5}
                  fontWeight={800}
                  fill="var(--foreground)"
                >
                  {row.phase.shortTitle}
                </text>

                <AnimatePresence initial={false}>
                  {row.items.map((item, index) => {
                    const cx = x(item.date);
                    const cy = centre + (dodges[index] ?? 0) * DODGE_STEP;

                    return (
                      // Position rides on motion's own x/y. A `transform` attribute
                      // here would be overwritten by the scale animation, stacking
                      // every mark at the origin.
                      <motion.g
                        key={item.task.id}
                        initial={{ opacity: 0, scale: 0.4, x: cx, y: cy }}
                        animate={{ opacity: 1, scale: 1, x: cx, y: cy }}
                        exit={{ opacity: 0, scale: 0.4 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                        onMouseEnter={() =>
                          setTooltip({
                            x: MARGIN.left + cx,
                            y: MARGIN.top + cy,
                            title: item.task.title,
                            when: formatDeadlineShort(item.task.deadline),
                            status: item.status,
                            who: normalizeWho(item.task.who),
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        className="cursor-pointer"
                      >
                        {/* A hit target larger than the mark, per interaction spec. */}
                        <circle r={MARK_RADIUS + 6} fill="transparent" />
                        <Mark status={item.status} />
                      </motion.g>
                    );
                  })}
                </AnimatePresence>
              </Group>
            );
          })}

          <AxisBottom
            top={innerHeight}
            scale={xScale}
            tickValues={axisTicks(timeline.domain)}
            tickFormat={(value) => formatTick(value as Date)}
            stroke="#E4D4B2"
            tickStroke="#E4D4B2"
            tickLabelProps={{
              fill: '#8A785C',
              fontSize: 11,
              fontWeight: 700,
              textAnchor: 'middle',
              dy: '0.25em',
            }}
          />
        </Group>
      </svg>

      {tooltip ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg
            border-2 border-border bg-card px-2.5 py-1.5 shadow-[0_6px_18px_rgba(90,70,40,0.14)]"
          style={{ left: tooltip.x, top: tooltip.y - 14 }}
        >
          <div className="text-[12.5px] font-extrabold whitespace-nowrap">{tooltip.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-bold text-[#8A785C]">
            {tooltip.status ? (
              <>
                <span style={{ color: TIMELINE_STATUS[tooltip.status] }}>
                  {STATUS_LABEL[tooltip.status]}
                </span>
                <span aria-hidden>·</span>
              </>
            ) : null}
            <span className="whitespace-nowrap">{tooltip.when}</span>
            {(tooltip.who ?? []).map((name) => (
              <AvatarGlyph key={name} avatar={avatarFor(name)} className="size-[13px] text-[11px]" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Measures width only, and leaves height to the flow.
 *
 * `ParentSize` cannot be used here: it renders a wrapper at `height: 100%` with
 * `overflow: hidden`, which collapses to zero inside an auto-height parent and
 * clips the whole chart away.
 */
function ChartArea({
  tasks,
  deliveries,
}: {
  tasks: readonly Task[];
  deliveries: readonly Delivery[];
}) {
  const { parentRef, width } = useParentSize({ debounceTime: 60, ignoreDimensions: ['height'] });

  return (
    <div ref={parentRef} className="w-full">
      {width > 0 ? <Chart tasks={tasks} deliveries={deliveries} width={width} /> : null}
    </div>
  );
}

/** The same data as a table: the chart's contrast relief, and useful on its own. */
function TimelineTable({
  tasks,
  deliveries,
}: {
  tasks: readonly Task[];
  deliveries: readonly Delivery[];
}) {
  const today = startOfToday();
  const momentDates = MOMENTS.map((moment) => moment.date);
  const timeline = buildTimeline(tasks, momentDates, deliveries, today);

  const taskRows = timeline.rows.flatMap((row) =>
    row.items.map((item) => ({
      key: item.task.id,
      group: row.phase.shortTitle,
      title: item.task.title,
      when: formatDeadlineShort(item.task.deadline),
      status: STATUS_LABEL[item.status],
      color: TIMELINE_STATUS[item.status],
    })),
  );

  // Lane order is a drawing concern; a table reads chronologically.
  const deliveryRows = timeline.deliveryLanes
    .flat()
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((bar) => ({
      key: bar.delivery.id,
      group: 'Levering',
      title: bar.delivery.label,
      when: `${formatDeadlineShort(bar.delivery.start)} t/m ${formatDeadlineShort(bar.delivery.end)}`,
      status: 'Ingepland',
      color: TIMELINE_DELIVERY,
    }));

  return (
    <details className="mt-4 text-[13px]">
      <summary className="cursor-pointer font-bold text-[#8A785C]">Toon als tabel</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[11.5px] tracking-wide text-[#8A785C] uppercase">
              <th className="py-1 pr-3 font-extrabold">Groep</th>
              <th className="py-1 pr-3 font-extrabold">Wat</th>
              <th className="py-1 pr-3 font-extrabold">Wanneer</th>
              <th className="py-1 font-extrabold">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...deliveryRows, ...taskRows].map((row) => (
              <tr key={row.key} className="border-t border-border">
                <td className="py-1.5 pr-3 font-semibold">{row.group}</td>
                <td className="py-1.5 pr-3 font-semibold">{row.title}</td>
                <td className="py-1.5 pr-3 font-bold whitespace-nowrap">{row.when}</td>
                <td className="py-1.5 font-bold" style={{ color: row.color }}>
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function undatedNote(count: number): string {
  if (count === 0) {
    return 'Elke taak heeft een datum.';
  }

  const noun = count === 1 ? 'taak staat' : 'taken staan';

  return `${count} ${noun} nog zonder datum, en dus niet op de tijdlijn.`;
}

export function TimelineView({
  tasks,
  deliveries,
}: {
  tasks: readonly Task[];
  deliveries: readonly Delivery[];
}) {
  const momentDates = MOMENTS.map((moment) => moment.date);
  const timeline = buildTimeline(tasks, momentDates, deliveries);
  const isEmpty = timeline.datedCount === 0 && timeline.deliveryLanes.length === 0;

  return (
    <section className="rounded-[14px] border-2 border-border bg-card px-4.5 pt-4.5 pb-3.5">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 className="flex-1 font-hand text-2xl font-bold">Tijdlijn 🗓️</h2>
        {/* A legend for marks that are not on screen only puzzles. */}
        {isEmpty ? null : <Legend hasDeliveries={timeline.deliveryLanes.length > 0} />}
      </div>

      {isEmpty ? (
        <p className="py-10 text-center text-sm font-semibold text-ink-faint">
          Nog niets met een datum. Zet een deadline op een taak, of plan een levering in.
        </p>
      ) : (
        <>
          <ChartArea tasks={tasks} deliveries={deliveries} />
          <p className="mt-2 text-[12.5px] font-bold text-ink-faint">
            {undatedNote(timeline.undatedCount)}
          </p>
          <TimelineTable tasks={tasks} deliveries={deliveries} />
        </>
      )}
    </section>
  );
}
