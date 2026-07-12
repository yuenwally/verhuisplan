'use client';

import { useState } from 'react';
import { CalendarDesign } from '@/components/timeline/calendar';
import { Segmented } from '@/components/timeline/segmented';
import { Legend } from '@/components/timeline/shared';
import { WeeksDesign } from '@/components/timeline/weeks';
import { startOfToday } from '@/lib/format';
import { MOMENTS } from '@/lib/plan-config';
import { buildTimeline } from '@/lib/timeline';
import type { Delivery, Task } from '@/lib/types';

type Mode = 'maand' | 'week';

const MODES: readonly { value: Mode; label: string }[] = [
  { value: 'maand', label: '▦ Maand' },
  { value: 'week', label: '▤ Week' },
];

export function CalendarView({
  tasks,
  deliveries,
}: {
  tasks: readonly Task[];
  deliveries: readonly Delivery[];
}) {
  const [mode, setMode] = useState<Mode>('maand');
  const today = startOfToday();
  const momentDates = MOMENTS.map((moment) => moment.date);
  const timeline = buildTimeline(tasks, momentDates, deliveries, today);
  const isEmpty = timeline.datedCount === 0 && timeline.deliveryLanes.length === 0;

  return (
    <section className="rounded-[14px] border-2 border-border bg-card px-4.5 pt-4.5 pb-3.5">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="font-hand text-2xl font-bold">Kalender 📅</h2>
        {isEmpty ? null : (
          <Segmented
            value={mode}
            onChange={setMode}
            options={MODES}
            ariaLabel="Maand- of weekweergave"
          />
        )}
        <div className="flex-1" />
        {isEmpty ? null : <Legend hasDeliveries={timeline.deliveryLanes.length > 0} />}
      </div>

      {isEmpty ? (
        <p className="py-10 text-center text-sm font-semibold text-ink-faint">
          Nog niets met een datum. Zet een deadline op een taak, of plan een levering in.
        </p>
      ) : mode === 'maand' ? (
        <CalendarDesign timeline={timeline} today={today} />
      ) : (
        <WeeksDesign timeline={timeline} today={today} />
      )}
    </section>
  );
}
