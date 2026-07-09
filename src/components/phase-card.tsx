'use client';

import { AnimatePresence, motion } from 'motion/react';
import { AddInput } from '@/components/add-input';
import { TaskRow } from '@/components/task-row';
import { TypingGhost } from '@/components/typing-ghost';
import { Progress } from '@/components/ui/progress';
import { useAddTask } from '@/hooks/use-plan';
import type { DragHandlers } from '@/hooks/use-drag-reorder';
import type { PhaseDef } from '@/lib/plan-config';
import type { Task } from '@/lib/types';

type PhaseCardProps = {
  phase: PhaseDef;
  tasks: readonly Task[];
  drag: DragHandlers;
};

export function PhaseCard({ phase, tasks, drag }: PhaseCardProps) {
  const addTask = useAddTask();
  const done = tasks.filter((task) => task.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <motion.section
      layout
      className="relative rounded-[14px] border-2 border-border bg-card px-4.5 pt-4.5 pb-3.5
        shadow-[0_6px_18px_rgba(90,70,40,0.07)]"
    >
      <div
        className="absolute -top-[11px] left-5.5 -rotate-2 px-3 py-[3px] font-hand text-[19px]
          font-bold shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        style={{ background: phase.tapeColor }}
      >
        {phase.label}
      </div>

      <div className="my-1.5 mb-3 flex items-center gap-3">
        <h2 className="flex-1 text-lg font-extrabold">{phase.title}</h2>
        <span className="text-[13px] font-extrabold whitespace-nowrap text-[#8A785C]">
          {done}/{tasks.length}
        </span>
        <Progress
          value={pct}
          aria-label={`${phase.title}: ${pct}% klaar`}
          className="h-2 w-[90px] bg-paper-sunken"
          indicatorClassName="bg-success"
        />
      </div>

      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} drag={drag} />
          ))}
        </AnimatePresence>
      </div>

      <TypingGhost
        phase={phase.id}
        className="mt-2 flex items-center gap-2 px-1.5 text-[15px] font-semibold"
      />

      <AddInput
        className="mt-2.5"
        placeholder="+ taak toevoegen…"
        buttonLabel="Voeg toe"
        typingPhase={phase.id}
        onSubmit={(title) => addTask(phase.id, title)}
      />
    </motion.section>
  );
}
