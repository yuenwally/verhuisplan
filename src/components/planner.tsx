'use client';

import { useStatus } from '@liveblocks/react/suspense';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ActivityCard } from '@/components/activity-card';
import { AvatarGlyph } from '@/components/avatar-glyph';
import { AvatarStack } from '@/components/avatar-stack';
import { BoardView } from '@/components/board-view';
import { CostsCard } from '@/components/costs-card';
import { CountdownCard } from '@/components/countdown-card';
import { Cursors } from '@/components/cursors';
import { DeliveriesCard } from '@/components/deliveries-card';
import { ListView } from '@/components/list-view';
import { QuestionsCard } from '@/components/questions-card';
import { TimelineView } from '@/components/timeline-view';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnnounceArrival, useDeliveries, useEnsureDeliveries, useTasks } from '@/hooks/use-plan';
import { daysUntil } from '@/lib/format';
import { MOMENTS } from '@/lib/plan-config';
import type { CurrentUser } from '@/lib/types';

function nextMomentLabel(): string {
  const upcoming = MOMENTS.map((moment) => ({ ...moment, days: daysUntil(moment.date) })).find(
    (moment) => moment.days >= 0,
  );

  if (!upcoming) {
    return 'Alles achter de rug!';
  }

  if (upcoming.days === 0) {
    return `Vandaag: ${upcoming.label.toLowerCase()}!`;
  }

  return `Nog ${upcoming.days} ${upcoming.days === 1 ? 'dag' : 'dagen'} tot de sleutels`;
}

type PlannerProps = {
  user: CurrentUser;
  /** True only on the connect right after picking a name, so reloads stay quiet. */
  announce: boolean;
  onLogout: () => void;
};

export function Planner({ user, announce, onLogout }: PlannerProps) {
  const tasks = useTasks();
  const deliveries = useDeliveries();
  const status = useStatus();
  const announceArrival = useAnnounceArrival();
  const ensureDeliveries = useEnsureDeliveries();
  const containerRef = useRef<HTMLDivElement>(null);
  const announced = useRef(false);
  const [view, setView] = useState('lijst');

  useEffect(() => {
    if (announce && !announced.current) {
      announced.current = true;
      announceArrival();
    }
  }, [announce, announceArrival]);

  // Rooms created before deliveries existed have no such key; add it once.
  useEffect(() => {
    if (deliveries === null) {
      ensureDeliveries();
    }
  }, [deliveries, ensureDeliveries]);

  const done = tasks.filter((task) => task.done).length;
  const totalPct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <Cursors containerRef={containerRef} />

      <div className="mx-auto max-w-[1240px] px-5 pt-5 pb-15">
        <header className="flex flex-wrap items-center gap-3.5 px-0.5 pt-1.5 pb-4.5">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-hand text-[40px] leading-none font-bold">Verhuisplan 📦</h1>
            <div
              className="flex -rotate-1 items-center gap-1.5 rounded-full bg-accent px-3 py-[5px]
                text-[13px] font-extrabold"
            >
              🔑 {nextMomentLabel()}
            </div>
          </div>

          <div className="flex-1" />

          <AnimatePresence>
            {status !== 'connected' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-full bg-accent/60 px-3 py-1.5 text-xs font-extrabold"
              >
                opnieuw verbinden…
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex items-center gap-2.5">
            <AvatarStack />
            <div
              className="flex items-center gap-2 rounded-full border-2 border-[#E0CFAC] bg-card
                py-1.5 pr-3.5 pl-2"
            >
              <AvatarGlyph avatar={user.avatar} className="size-[22px] text-[22px]" />
              <span className="text-[15px] font-extrabold">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="h-auto cursor-pointer rounded-full border-2 border-[#D8C6A0] px-3 py-2
                text-[13px] font-bold text-secondary-foreground hover:bg-card"
            >
              Uitloggen
            </Button>
          </div>
        </header>

        <div className="mb-4.5 flex flex-wrap items-center gap-3">
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="h-auto gap-1.5 rounded-xl bg-paper-sunken p-[5px]">
              <TabsTrigger
                value="lijst"
                className="cursor-pointer rounded-[9px] px-4.5 py-2 text-sm font-extrabold
                  data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                ☰ Lijst
              </TabsTrigger>
              <TabsTrigger
                value="bord"
                className="cursor-pointer rounded-[9px] px-4.5 py-2 text-sm font-extrabold
                  data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                ▦ Bord
              </TabsTrigger>
              <TabsTrigger
                value="tijdlijn"
                className="cursor-pointer rounded-[9px] px-4.5 py-2 text-sm font-extrabold
                  data-[state=active]:bg-foreground data-[state=active]:text-background"
              >
                ▤ Tijdlijn
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex min-w-[180px] flex-1 items-center gap-2.5">
            <Progress
              value={totalPct}
              aria-label={`${totalPct}% van alle taken klaar`}
              className="h-3.5 flex-1 bg-paper-sunken"
              indicatorClassName="bg-gradient-to-r from-primary to-accent"
            />
            <span className="text-sm font-extrabold whitespace-nowrap">
              {done} van {tasks.length} klaar
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-5.5">
          <main className="min-w-[340px] flex-[2.4]">
            {view === 'lijst' ? <ListView tasks={tasks} /> : null}
            {view === 'bord' ? <BoardView tasks={tasks} /> : null}
            {view === 'tijdlijn' ? (
              <TimelineView tasks={tasks} deliveries={deliveries ?? []} />
            ) : null}
          </main>

          <aside className="flex min-w-[290px] flex-1 flex-col gap-4.5">
            <CountdownCard />
            <QuestionsCard />
            <DeliveriesCard />
            <CostsCard />
            <ActivityCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
