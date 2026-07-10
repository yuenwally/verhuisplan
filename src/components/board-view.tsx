'use client';

import { AnimatePresence, motion } from 'motion/react';
import { AddInput } from '@/components/add-input';
import { TaskCard } from '@/components/task-card';
import { TypingGhost } from '@/components/typing-ghost';
import { useDragReorder } from '@/hooks/use-drag-reorder';
import { useAddTask, useCommentCounts } from '@/hooks/use-plan';
import { PHASES } from '@/lib/plan-config';
import type { Task } from '@/lib/types';

export function BoardView({ tasks }: { tasks: readonly Task[] }) {
  const addTask = useAddTask();
  const commentCounts = useCommentCounts();
  const drag = useDragReorder();

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-3.5">
      {PHASES.map((phase) => {
        const phaseTasks = tasks.filter((task) => task.phase === phase.id);
        const done = phaseTasks.filter((task) => task.done).length;

        return (
          <div
            key={phase.id}
            className="w-[260px] min-w-[260px] rounded-[14px] bg-paper-sunken p-3"
          >
            <div className="mb-2.5 flex items-center gap-2">
              <h2 className="flex-1 font-hand text-[21px] font-bold">{phase.shortTitle}</h2>
              <span className="text-xs font-extrabold text-[#8A785C]">
                {done}/{phaseTasks.length}
              </span>
            </div>

            <motion.div layout className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {phaseTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    drag={drag}
                    commentCount={commentCounts[task.id] ?? 0}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            <TypingGhost
              phase={phase.id}
              className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold"
            />

            <AddInput
              className="mt-2.5"
              placeholder="+ taak…"
              typingPhase={phase.id}
              inputClassName="rounded-[9px] px-2.5 py-2 text-[13px]"
              onSubmit={(title) => addTask(phase.id, title)}
            />
          </div>
        );
      })}
    </div>
  );
}
