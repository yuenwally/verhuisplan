'use client';

import { motion } from 'motion/react';
import {
  STATUS_LABEL,
  StatusDot,
  TIMELINE_DELIVERY,
  TIMELINE_STATUS,
  WhoAvatars,
  dayKey,
  deliveryWhen,
  flatDeliveries,
  flatTasks,
  formatDayShort,
  momentPins,
  weeksIn,
} from '@/components/timeline/shared';
import type { Timeline } from '@/lib/timeline';

export function WeeksDesign({ timeline, today }: { timeline: Timeline; today: Date }) {
  const tasks = flatTasks(timeline);
  const deliveries = flatDeliveries(timeline);
  const moments = momentPins();
  const weeks = weeksIn(timeline.domain);

  return (
    <div className="scrollbar-hide -mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex gap-3">
        {weeks.map((week, index) => {
          const start = week[0];
          const end = week[6];

          if (!start || !end) {
            return null;
          }

          const isCurrent = today >= start && today <= end;
          const weekTasks = tasks.filter((item) => item.date >= start && item.date <= end);
          const weekDeliveries = deliveries.filter((bar) => bar.start <= end && bar.end >= start);
          const weekMoments = moments.filter(
            (moment) => moment.date >= start && moment.date <= end,
          );
          const isEmpty =
            weekTasks.length === 0 && weekDeliveries.length === 0 && weekMoments.length === 0;

          return (
            <motion.div
              key={dayKey(start)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.25) }}
              className={`flex w-[210px] shrink-0 flex-col rounded-2xl border-2 p-2.5 ${
                isCurrent ? 'border-primary bg-primary/8' : 'border-border bg-paper-sunken/40'
              }`}
            >
              <div className="mb-2 flex items-baseline justify-between px-0.5">
                <span className="text-[12.5px] font-extrabold">
                  Week van {formatDayShort(start)}
                </span>
                {isCurrent ? (
                  <span className="text-[10px] font-extrabold tracking-wide text-primary uppercase">
                    Nu
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                {weekMoments.map((moment) => (
                  <div
                    key={moment.label}
                    className="rounded-lg bg-accent px-2 py-1.5 text-[11.5px] font-extrabold"
                  >
                    {moment.emoji} {moment.label}
                  </div>
                ))}

                {weekDeliveries.map((bar) => (
                  <div
                    key={bar.delivery.id}
                    className="rounded-lg border-2 bg-card px-2 py-1.5"
                    style={{ borderColor: TIMELINE_DELIVERY }}
                  >
                    <div
                      className="text-[12px] font-bold"
                      style={{ color: TIMELINE_DELIVERY }}
                    >
                      📦 {bar.delivery.label}
                    </div>
                    <div className="mt-0.5 text-[10.5px] font-semibold text-[#8A785C]">
                      {deliveryWhen(bar)}
                    </div>
                  </div>
                ))}

                {weekTasks.map((item) => (
                  <div
                    key={item.task.id}
                    className="rounded-lg border-2 border-border bg-card px-2 py-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={item.status} size={14} />
                      <span className="text-[12px] leading-tight font-bold">{item.task.title}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className="text-[10.5px] font-bold"
                        style={{ color: TIMELINE_STATUS[item.status] }}
                      >
                        {formatDayShort(item.date)} · {STATUS_LABEL[item.status]}
                      </span>
                      <span className="ml-auto">
                        <WhoAvatars who={item.task.who} />
                      </span>
                    </div>
                  </div>
                ))}

                {isEmpty ? (
                  <p className="px-0.5 py-3 text-center text-[11px] font-semibold text-ink-faint">
                    Niets gepland
                  </p>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
