'use client';

import { motion } from 'motion/react';
import { useId } from 'react';
import { AssigneeMenu } from '@/components/assignee-menu';
import { useFlash } from '@/components/flash-provider';
import { TaskComments } from '@/components/task-comments';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useTaskActions } from '@/hooks/use-task-actions';
import { formatDeadlineShort, isOverdue, tint } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { DragHandlers } from '@/hooks/use-drag-reorder';
import type { Task } from '@/lib/types';

const CARD_PADDING_Y = 10;

/** The board view's compact card. Same data, fewer controls than the list row. */
export function TaskCard({
  task,
  drag,
  commentCount,
}: {
  task: Task;
  drag: DragHandlers;
  commentCount: number;
}) {
  const { onToggle, onToggleAssignee } = useTaskActions(task.id);
  const { flashes } = useFlash();
  const checkboxId = useId();

  const overdue = isOverdue(task.deadline, task.done);
  const flashColor = flashes[task.id];

  return (
    <motion.div
      layout="position"
      {...listItemMotion(CARD_PADDING_Y)}
      data-task-id={task.id}
      style={flashColor ? { background: tint(flashColor) } : undefined}
      className="group overflow-hidden rounded-[10px] border-[1.5px] border-border bg-card px-2.5
        shadow-[0_2px_6px_rgba(90,70,40,0.06)] transition-colors duration-300"
    >
      {/* Completed cards dim through a class, so the enter fade above stays free
          to animate opacity without the two fighting over the same inline style. */}
      <div className={cn('transition-opacity duration-300', task.done && 'opacity-55')}>
        <div className="flex items-start gap-2">
          <span
            {...drag.handleProps(task.id)}
            aria-hidden
            className="mt-0.5 shrink-0 cursor-grab touch-none text-[13px] text-[#C9B48C] select-none
              active:cursor-grabbing"
          >
            ⠿
          </span>
          <Checkbox
            id={checkboxId}
            checked={task.done}
            onCheckedChange={onToggle}
            className="mt-px size-4 min-w-4 rounded-[5px]"
            iconClassName="text-[10px]"
          />
          <Label
            htmlFor={checkboxId}
            className={cn(
              'flex-1 cursor-pointer text-[13.5px] leading-snug font-bold',
              task.done && 'text-ink-faint line-through',
            )}
          >
            {task.title}
          </Label>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <AssigneeMenu
            who={task.who}
            onToggle={onToggleAssignee}
            className="h-[22px]"
            glyphClassName="size-[13px] text-[11px]"
          />
          <span
            className={cn(
              'text-[11.5px] font-extrabold',
              overdue ? 'text-destructive' : 'text-[#8A785C]',
            )}
          >
            {formatDeadlineShort(task.deadline)}
          </span>
          <div className="flex-1" />
          <TaskComments taskId={task.id} count={commentCount} />
        </div>
      </div>
    </motion.div>
  );
}
