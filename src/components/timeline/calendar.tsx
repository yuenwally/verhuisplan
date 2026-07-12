'use client';

import { motion } from 'motion/react';
import {
  MONTHS,
  StatusDot,
  TIMELINE_DELIVERY,
  WEEKDAYS,
  dayKey,
  flatDeliveries,
  flatTasks,
  momentPins,
  sameDay,
  weeksIn,
} from '@/components/timeline/shared';
import { truncate } from '@/lib/format';
import type { Timeline } from '@/lib/timeline';

export function CalendarDesign({ timeline, today }: { timeline: Timeline; today: Date }) {
  const tasks = flatTasks(timeline);
  const deliveries = flatDeliveries(timeline);
  const moments = momentPins();
  const weeks = weeksIn(timeline.domain);

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div className="min-w-[620px]">
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((name) => (
            <div
              key={name}
              className="pb-1 text-center text-[11px] font-extrabold tracking-wide text-[#8A785C]
                uppercase"
            >
              {name}
            </div>
          ))}

          {weeks.flat().map((day, index) => {
            const inDomain = day >= timeline.domain[0] && day <= timeline.domain[1];
            const isToday = sameDay(day, today);
            const firstOfMonth = day.getDate() === 1 || index < 7;
            const dayTasks = tasks.filter((item) => sameDay(item.date, day));
            const dayDeliveries = deliveries.filter(
              (bar) => day >= bar.start && day <= bar.end,
            );
            const dayMoments = moments.filter((moment) => sameDay(moment.date, day));

            return (
              <motion.div
                key={dayKey(day)}
                initial={{ opacity: 0 }}
                animate={{ opacity: inDomain ? 1 : 0.45 }}
                transition={{ duration: 0.2 }}
                className={`min-h-[74px] rounded-[4px] border-2 p-1.5 ${
                  isToday
                    ? 'border-primary bg-primary/8'
                    : 'border-border bg-card'
                }`}
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <span
                    className={`text-[13px] font-extrabold ${
                      isToday ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {firstOfMonth ? (
                    <span className="text-[10px] font-bold text-[#8A785C]">
                      {MONTHS[day.getMonth()]}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1">
                  {dayMoments.map((moment) => (
                    <div
                      key={moment.label}
                      className="truncate rounded-md bg-accent px-1.5 py-0.5 text-[10.5px] font-extrabold"
                      title={moment.label}
                    >
                      {moment.emoji} {truncate(moment.label, 12)}
                    </div>
                  ))}

                  {dayDeliveries.map((bar) => {
                    // Label the delivery on its start day and again each Monday, so a
                    // multi-week window stays named; other days get a bare strip.
                    const named = sameDay(day, bar.start) || (day.getDay() + 6) % 7 === 0;

                    return (
                      <div
                        key={bar.delivery.id}
                        className="truncate rounded-md px-1.5 py-0.5 text-[10.5px] font-bold text-white"
                        style={{ backgroundColor: named ? TIMELINE_DELIVERY : `${TIMELINE_DELIVERY}55` }}
                        title={bar.delivery.label}
                      >
                        {named ? `📦 ${truncate(bar.delivery.label, 11)}` : ' '}
                      </div>
                    );
                  })}

                  {dayTasks.map((item) => (
                    <div
                      key={item.task.id}
                      className="flex items-center gap-1 rounded-md px-1 py-0.5 text-[10.5px]
                        font-semibold"
                      style={{ backgroundColor: item.phase.tapeColor }}
                      title={`${item.task.title} — ${item.phase.shortTitle}`}
                    >
                      <StatusDot status={item.status} size={12} />
                      <span className="truncate">{truncate(item.task.title, 13)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
