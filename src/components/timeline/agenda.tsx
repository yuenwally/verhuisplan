'use client';

import { motion } from 'motion/react';
import {
  MONTHS,
  STATUS_LABEL,
  StatusDot,
  TIMELINE_DELIVERY,
  TIMELINE_STATUS,
  WEEKDAYS,
  WhoAvatars,
  dayKey,
  deliveryWhen,
  flatDeliveries,
  flatTasks,
  momentPins,
  sameDay,
} from '@/components/timeline/shared';
import type { FlatTask, MomentPin } from '@/components/timeline/shared';
import type { DeliveryBar, Timeline } from '@/lib/timeline';

type DayGroup = {
  date: Date;
  moments: MomentPin[];
  deliveries: DeliveryBar[];
  tasks: FlatTask[];
};

/** Every day that has something on it, in order. Deliveries land on their start
 *  day; a window's later days are read from its `t/m` label, not repeated. */
function groupByDay(timeline: Timeline): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  const reach = (date: Date): DayGroup => {
    const key = dayKey(date);
    const existing = groups.get(key);

    if (existing) {
      return existing;
    }

    const created: DayGroup = { date, moments: [], deliveries: [], tasks: [] };
    groups.set(key, created);

    return created;
  };

  for (const moment of momentPins()) {
    reach(moment.date).moments.push(moment);
  }

  for (const bar of flatDeliveries(timeline)) {
    reach(bar.start).deliveries.push(bar);
  }

  for (const item of flatTasks(timeline)) {
    reach(item.date).tasks.push(item);
  }

  return [...groups.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function AgendaDesign({ timeline, today }: { timeline: Timeline; today: Date }) {
  const days = groupByDay(timeline);

  return (
    <ol className="mt-1">
      {days.map((group, index) => {
        const isToday = sameDay(group.date, today);
        const isPast = group.date < today && !isToday;

        return (
          <motion.li
            key={dayKey(group.date)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.2) }}
            className="flex gap-3"
          >
            {/* The date, read once for the whole day. */}
            <div className={`w-[52px] shrink-0 pt-0.5 text-right ${isPast ? 'opacity-55' : ''}`}>
              <div className="text-[11px] font-bold text-[#8A785C]">
                {WEEKDAYS[(group.date.getDay() + 6) % 7]}
              </div>
              <div
                className={`text-[19px] leading-none font-extrabold ${
                  isToday ? 'text-primary' : 'text-foreground'
                }`}
              >
                {group.date.getDate()}
              </div>
              <div className="text-[11px] font-bold text-[#8A785C]">
                {MONTHS[group.date.getMonth()]}
              </div>
            </div>

            {/* The rail, with a node coloured for today. */}
            <div
              className={`relative border-l-2 pb-4 pl-4 ${
                index === days.length - 1 ? 'border-transparent' : 'border-border'
              }`}
            >
              <span
                className={`absolute top-1.5 -left-[7px] size-3 rounded-full border-2 border-card ${
                  isToday ? 'bg-primary' : 'bg-[#C9B48C]'
                }`}
              />

              {isToday ? (
                <div className="mb-1.5 text-[11px] font-extrabold tracking-wide text-primary uppercase">
                  Vandaag
                </div>
              ) : null}

              <div className={`flex flex-col gap-1.5 ${isPast ? 'opacity-65' : ''}`}>
                {group.moments.map((moment) => (
                  <div
                    key={moment.label}
                    className="w-fit rounded-lg bg-accent px-2.5 py-1 text-[12.5px] font-extrabold"
                  >
                    {moment.emoji} {moment.label}
                  </div>
                ))}

                {group.deliveries.map((bar) => (
                  <div
                    key={bar.delivery.id}
                    className="flex w-fit items-center gap-2 rounded-lg border-2 px-2.5 py-1
                      text-[12.5px] font-bold"
                    style={{ borderColor: TIMELINE_DELIVERY, color: TIMELINE_DELIVERY }}
                  >
                    <span>📦 {bar.delivery.label}</span>
                    <span className="text-[11px] font-semibold opacity-80">{deliveryWhen(bar)}</span>
                  </div>
                ))}

                {group.tasks.map((item) => (
                  <div
                    key={item.task.id}
                    className="flex items-center gap-2 rounded-lg border-2 border-border bg-card px-2.5
                      py-1"
                  >
                    <span className="text-[13px] font-bold">{item.task.title}</span>
                    {/* Phase, status and who sit at the end, so titles line up. */}
                    <div className="ml-auto flex shrink-0 items-center gap-2">
                      <span
                        className="rounded-full px-1.5 py-px text-[10px] font-bold"
                        style={{ backgroundColor: item.phase.tapeColor }}
                      >
                        {item.phase.shortTitle}
                      </span>
                      <span
                        className="flex items-center gap-1 text-[11px] font-bold"
                        style={{ color: TIMELINE_STATUS[item.status] }}
                      >
                        <StatusDot status={item.status} size={13} />
                        {STATUS_LABEL[item.status]}
                      </span>
                      <WhoAvatars who={item.task.who} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
