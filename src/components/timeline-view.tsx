'use client';

import { useState } from 'react';
import { AgendaDesign } from '@/components/timeline/agenda';
import { GanttDesign } from '@/components/timeline/gantt';
import { Segmented } from '@/components/timeline/segmented';
import { Legend, STATUS_LABEL } from '@/components/timeline/shared';
import { formatDeadlineShort, startOfToday } from '@/lib/format';
import { MOMENTS, TIMELINE_DELIVERY, TIMELINE_STATUS } from '@/lib/plan-config';
import { buildTimeline } from '@/lib/timeline';
import type { Delivery, Task } from '@/lib/types';

type Orientation = 'horizontaal' | 'verticaal';

const ORIENTATIONS: readonly { value: Orientation; label: string }[] = [
  { value: 'horizontaal', label: '▤ Horizontaal' },
  { value: 'verticaal', label: '☰ Verticaal' },
];

function undatedNote(count: number): string {
  if (count === 0) {
    return 'Elke taak heeft een datum.';
  }

  const noun = count === 1 ? 'taak staat' : 'taken staan';

  return `${count} ${noun} nog zonder datum, en dus niet op de tijdlijn.`;
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

export function TimelineView({
  tasks,
  deliveries,
}: {
  tasks: readonly Task[];
  deliveries: readonly Delivery[];
}) {
  const [orientation, setOrientation] = useState<Orientation>('horizontaal');
  const today = startOfToday();
  const momentDates = MOMENTS.map((moment) => moment.date);
  const timeline = buildTimeline(tasks, momentDates, deliveries, today);
  const isEmpty = timeline.datedCount === 0 && timeline.deliveryLanes.length === 0;

  return (
    <section className="rounded-[14px] border-2 border-border bg-card px-4.5 pt-4.5 pb-3.5">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="font-hand text-2xl font-bold">Tijdlijn 🗓️</h2>
        {isEmpty ? null : (
          <Segmented
            value={orientation}
            onChange={setOrientation}
            options={ORIENTATIONS}
            ariaLabel="Richting van de tijdlijn"
          />
        )}
        <div className="flex-1" />
        {/* A legend for marks that are not on screen only puzzles. */}
        {isEmpty ? null : <Legend hasDeliveries={timeline.deliveryLanes.length > 0} />}
      </div>

      {isEmpty ? (
        <p className="py-10 text-center text-sm font-semibold text-ink-faint">
          Nog niets met een datum. Zet een deadline op een taak, of plan een levering in.
        </p>
      ) : (
        <>
          {orientation === 'horizontaal' ? (
            <GanttDesign timeline={timeline} today={today} />
          ) : (
            <AgendaDesign timeline={timeline} today={today} />
          )}

          <p className="mt-3 text-[12.5px] font-bold text-ink-faint">
            {undatedNote(timeline.undatedCount)}
          </p>
          <TimelineTable tasks={tasks} deliveries={deliveries} />
        </>
      )}
    </section>
  );
}
