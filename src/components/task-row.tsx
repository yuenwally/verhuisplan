'use client';

import { motion } from 'motion/react';
import { useId } from 'react';
import { AssigneeMenu } from '@/components/assignee-menu';
import { useFlash } from '@/components/flash-provider';
import { TaskComments } from '@/components/task-comments';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDeleteTask, useSetDeadline } from '@/hooks/use-plan';
import { useTaskActions } from '@/hooks/use-task-actions';
import { isOverdue, tint } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { DragHandlers } from '@/hooks/use-drag-reorder';
import type { Task } from '@/lib/types';

const DRAG_BG = '#F2E7CF';
const ROW_PADDING_Y = 8;

// The row has no corner radius on purpose: its only visible edge is the dashed
// top border, and a radius bends that line into a curve at each end.

/** The assignee pill and the deadline field share this, so they line up. */
const CONTROL_HEIGHT = 'h-6';

export function TaskRow({
  task,
  drag,
  commentCount,
}: {
  task: Task;
  drag: DragHandlers;
  commentCount: number;
}) {
  const { onToggle, onToggleAssignee } = useTaskActions(task.id);
  const setDeadline = useSetDeadline();
  const deleteTask = useDeleteTask();
  const { flashes, flash } = useFlash();
  const checkboxId = useId();

  const overdue = isOverdue(task.deadline, task.done);
  const flashColor = flashes[task.id];
  const isDragging = drag.dragId === task.id;

  const background = isDragging ? DRAG_BG : flashColor ? tint(flashColor) : 'transparent';

  return (
    <motion.div
      layout="position"
      {...listItemMotion(ROW_PADDING_Y)}
      draggable
      onDragStart={() => drag.onDragStart(task.id)}
      onDragEnter={() => drag.onDragEnter(task.id)}
      onDragOver={(event) => event.preventDefault()}
      onDragEnd={drag.onDragEnd}
      style={{ background }}
      className="group flex items-center gap-2.5 overflow-hidden border-t border-dashed
        border-border px-1.5 transition-colors duration-300"
    >
      <span aria-hidden className="cursor-grab text-[15px] text-[#C9B48C] select-none">
        ⠿
      </span>

      <Checkbox
        id={checkboxId}
        checked={task.done}
        onCheckedChange={onToggle}
        className="size-4 min-w-4 rounded-[5px]"
        iconClassName="text-[10px]"
      />

      <Label
        htmlFor={checkboxId}
        className={cn(
          'min-w-[160px] flex-1 cursor-pointer text-[15px] leading-snug font-semibold',
          task.done && 'text-ink-faint',
        )}
      >
        <span className="relative inline-block">
          {task.title}
          <motion.span
            aria-hidden
            className="absolute top-1/2 left-0 h-[1.5px] w-full origin-left bg-current"
            initial={false}
            animate={{ scaleX: task.done ? 1 : 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </span>
      </Label>

      <TaskComments taskId={task.id} count={commentCount} />

      <AssigneeMenu who={task.who} onToggle={onToggleAssignee} className={CONTROL_HEIGHT} />

      <input
        type="date"
        value={task.deadline}
        aria-label="Deadline"
        onChange={(event) => {
          setDeadline(task.id, event.target.value);
          flash(task.id);
        }}
        className={cn(
          `w-[118px] rounded-lg border-[1.5px] border-input bg-background px-1.5 text-xs font-bold
          outline-none`,
          CONTROL_HEIGHT,
          overdue ? 'text-destructive' : 'text-[#8A785C]',
        )}
      />

      <button
        type="button"
        aria-label="Taak verwijderen"
        onClick={() => deleteTask(task.id)}
        className="flex size-4 shrink-0 cursor-pointer items-center justify-center text-[13px]
          leading-none text-[#C9B48C] transition-colors hover:text-destructive"
      >
        ✕
      </button>
    </motion.div>
  );
}
