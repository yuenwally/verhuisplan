'use client';

import { motion } from 'motion/react';
import { useFlash } from '@/components/flash-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { useTaskActions } from '@/hooks/use-task-actions';
import { formatDeadlineShort, isOverdue, tint, whoLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DragHandlers } from '@/hooks/use-drag-reorder';
import type { Task } from '@/lib/types';

/** The board view's compact card. Same data, fewer controls than the list row. */
export function TaskCard({ task, drag }: { task: Task; drag: DragHandlers }) {
  const { onToggle, onCycleWho } = useTaskActions(task.id);
  const { flashes } = useFlash();

  const overdue = isOverdue(task.deadline, task.done);
  const flashColor = flashes[task.id];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: task.done ? 0.55 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      draggable
      onDragStart={() => drag.onDragStart(task.id)}
      onDragEnter={() => drag.onDragEnter(task.id)}
      onDragOver={(event) => event.preventDefault()}
      onDragEnd={drag.onDragEnd}
      style={flashColor ? { background: tint(flashColor) } : undefined}
      className="overflow-hidden rounded-[10px] border-[1.5px] border-border bg-card p-2.5
        shadow-[0_2px_6px_rgba(90,70,40,0.06)] transition-colors duration-300"
    >
      <div className="flex items-start gap-2">
        <Checkbox
          checked={task.done}
          onCheckedChange={onToggle}
          aria-label={task.done ? 'Taak heropenen' : 'Taak afvinken'}
          className="size-[22px] min-w-[22px] rounded-[7px]"
          iconClassName="text-xs"
        />
        <div
          className={cn(
            'flex-1 text-[13.5px] font-bold',
            task.done && 'text-ink-faint line-through',
          )}
        >
          {task.title}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onCycleWho}
          className="cursor-pointer rounded-full border-[1.5px] border-input bg-background px-2
            py-0.5 text-[11.5px] font-extrabold text-secondary-foreground"
        >
          {whoLabel(task.who)}
        </button>
        <span
          className={cn(
            'text-[11.5px] font-extrabold',
            overdue ? 'text-destructive' : 'text-[#8A785C]',
          )}
        >
          {formatDeadlineShort(task.deadline)}
        </span>
      </div>
    </motion.div>
  );
}
