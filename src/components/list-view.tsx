'use client';

import { PhaseCard } from '@/components/phase-card';
import { useDragReorder } from '@/hooks/use-drag-reorder';
import { PHASES } from '@/lib/plan-config';
import type { Task } from '@/lib/types';

export function ListView({ tasks }: { tasks: readonly Task[] }) {
  const drag = useDragReorder();

  return (
    <div className="flex flex-col gap-4.5">
      {PHASES.map((phase) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          tasks={tasks.filter((task) => task.phase === phase.id)}
          drag={drag}
        />
      ))}
    </div>
  );
}
