'use client';

import { motion } from 'motion/react';
import { useFlash } from '@/components/flash-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeleteTask, useSetDeadline } from '@/hooks/use-plan';
import { useTaskActions } from '@/hooks/use-task-actions';
import { isOverdue, tint, whoLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DragHandlers } from '@/hooks/use-drag-reorder';
import type { Task } from '@/lib/types';

const DRAG_BG = '#F2E7CF';

export function TaskRow({ task, drag }: { task: Task; drag: DragHandlers }) {
  const { onToggle, onCycleWho } = useTaskActions(task.id);
  const setDeadline = useSetDeadline();
  const deleteTask = useDeleteTask();
  const { flashes, flash } = useFlash();

  const overdue = isOverdue(task.deadline, task.done);
  const flashColor = flashes[task.id];
  const isDragging = drag.dragId === task.id;

  const background = isDragging ? DRAG_BG : flashColor ? tint(flashColor) : 'transparent';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 12, height: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      draggable
      onDragStart={() => drag.onDragStart(task.id)}
      onDragEnter={() => drag.onDragEnter(task.id)}
      onDragOver={(event) => event.preventDefault()}
      onDragEnd={drag.onDragEnd}
      style={{ background }}
      className="flex items-center gap-2.5 overflow-hidden rounded-[10px] border-t border-dashed
        border-border px-1.5 py-2 transition-colors duration-300"
    >
      <span aria-hidden className="cursor-grab text-[15px] text-[#C9B48C] select-none">
        ⠿
      </span>

      <Checkbox
        checked={task.done}
        onCheckedChange={onToggle}
        aria-label={task.done ? 'Taak heropenen' : 'Taak afvinken'}
        className="size-[26px] min-w-[26px]"
        iconClassName="text-[15px]"
      />

      <div className="min-w-[160px] flex-1 text-[15px] font-semibold">
        <span className={cn('relative inline-block transition-colors', task.done && 'text-ink-faint')}>
          {task.title}
          <motion.span
            aria-hidden
            className="absolute top-1/2 left-0 h-[1.5px] w-full origin-left bg-current"
            initial={false}
            animate={{ scaleX: task.done ? 1 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </span>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onCycleWho}
            className="cursor-pointer rounded-full border-[1.5px] border-input bg-background px-2.5
              py-1 text-[12.5px] font-extrabold whitespace-nowrap text-secondary-foreground"
          >
            {whoLabel(task.who)}
          </button>
        </TooltipTrigger>
        <TooltipContent>Klik om toe te wijzen</TooltipContent>
      </Tooltip>

      <input
        type="date"
        value={task.deadline}
        aria-label="Deadline"
        onChange={(event) => {
          setDeadline(task.id, event.target.value);
          flash(task.id);
        }}
        className={cn(
          `w-[118px] rounded-lg border-[1.5px] border-input bg-background px-1.5 py-[3px] text-xs
          font-bold outline-none`,
          overdue ? 'text-destructive' : 'text-[#8A785C]',
        )}
      />

      <button
        type="button"
        aria-label="Taak verwijderen"
        onClick={() => deleteTask(task.id)}
        className="cursor-pointer px-1 py-0.5 text-[17px] text-[#C9B48C] transition-colors
          hover:text-destructive"
      >
        ✕
      </button>
    </motion.div>
  );
}
