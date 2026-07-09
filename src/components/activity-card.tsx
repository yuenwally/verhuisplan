'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AvatarGlyph } from '@/components/avatar-glyph';
import { useActivity } from '@/hooks/use-plan';
import { timeAgo } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';

/** Re-renders once a minute so "zojuist" ages into "3 min geleden" on its own. */
function useMinuteTick() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 60_000);

    return () => clearInterval(timer);
  }, []);
}

export function ActivityCard() {
  const activity = useActivity();
  useMinuteTick();

  return (
    <section className="rounded-[14px] border-2 border-border bg-card p-4.5">
      <h2 className="mb-2.5 font-hand text-2xl font-bold">Activiteit 📣</h2>

      <div className="flex flex-col gap-2.25">
        <AnimatePresence initial={false}>
          {activity.map((entry) => (
            <motion.div
              key={entry.id}
              layout="position"
              {...listItemMotion()}
              className="flex items-start gap-2.25 overflow-hidden"
            >
              <AvatarGlyph avatar={entry.avatar} className="size-[17px] text-[17px]" />
              <div className="flex-1">
                <div className="text-[13px] leading-[1.35] font-semibold">
                  <b>{entry.user}</b> {entry.text}
                </div>
                <div className="text-[11px] font-bold text-ink-faint">{timeAgo(entry.ts)}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activity.length === 0 ? (
          <p className="text-[13px] font-semibold text-ink-faint">
            Nog geen activiteit — vink iets af!
          </p>
        ) : null}
      </div>
    </section>
  );
}
