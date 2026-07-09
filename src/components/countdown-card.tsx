'use client';

import { daysUntil, formatMomentDate } from '@/lib/format';
import { MOMENTS } from '@/lib/plan-config';

function unitFor(days: number): string {
  if (days > 0) {
    return days === 1 ? 'dag' : 'dagen';
  }

  return days === 0 ? 'vandaag' : 'geweest';
}

function countFor(days: number): string {
  if (days > 0) {
    return String(days);
  }

  return days === 0 ? 'nu!' : '✓';
}

export function CountdownCard() {
  return (
    <section className="rounded-[14px] bg-foreground p-4.5 text-background">
      <h2 className="mb-3 font-hand text-2xl font-bold">Aftellen ⏳</h2>
      <div className="flex flex-col gap-2.5">
        {MOMENTS.map((moment) => {
          const days = daysUntil(moment.date);

          return (
            <div
              key={moment.label}
              className="flex items-center gap-3 rounded-[10px] bg-[#FDF8EE]/8 px-3 py-2.5"
            >
              <span className="text-[22px]">{moment.emoji}</span>
              <div className="flex-1">
                <div className="text-[13.5px] font-extrabold">{moment.label}</div>
                <div className="text-xs text-[#C9B48C]">{formatMomentDate(moment.date)}</div>
              </div>
              <div className="text-right">
                <div className="text-xl leading-none font-extrabold text-accent">
                  {countFor(days)}
                </div>
                <div
                  className="text-[10.5px] font-bold tracking-[0.06em] text-[#C9B48C] uppercase"
                >
                  {unitFor(days)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
