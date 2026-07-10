'use client';

import { motion } from 'motion/react';
import { useId, useState } from 'react';
import { AssigneeMenu } from '@/components/assignee-menu';
import { useFlash } from '@/components/flash-provider';
import { TaskComments } from '@/components/task-comments';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useIsTouch } from '@/hooks/use-is-touch';
import { useDeleteTask, useSetDeadline } from '@/hooks/use-plan';
import { useTaskActions } from '@/hooks/use-task-actions';
import { isOverdue, tint } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { DragHandlers } from '@/hooks/use-drag-reorder';
import type { Task } from '@/lib/types';

const DRAG_BG = '#F2E7CF';

/** The assignee pill and the deadline field share this, so they line up. */
const CONTROL_HEIGHT = 'h-6';

/** How far a row slides aside to uncover the delete button. */
const SWIPE_WIDTH = 96;

// The row has no corner radius on purpose: its only visible edge is the dashed
// top border, and a radius bends that line into a curve at each end.
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
  const isTouch = useIsTouch();
  const checkboxId = useId();
  const [swiped, setSwiped] = useState(false);

  const overdue = isOverdue(task.deadline, task.done);
  const flashColor = flashes[task.id];
  const isDragging = drag.dragId === task.id;

  const background = isDragging ? DRAG_BG : flashColor ? tint(flashColor) : 'var(--card)';

  return (
    <motion.div
      layout="position"
      // Zero padding here: the row's vertical padding lives on the sliding layer,
      // so the delete button behind it spans exactly the visible row and no more.
      {...listItemMotion(0)}
      data-task-id={task.id}
      className="relative overflow-hidden border-t border-dashed border-border"
    >
      {/* Uncovered by swiping. Touch has no hover, so the ✕ cannot hide in the row. */}
      {isTouch ? (
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          style={{ width: SWIPE_WIDTH }}
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive
            text-[13px] font-extrabold text-destructive-foreground"
        >
          Verwijder
        </button>
      ) : null}

      <motion.div
        drag={isTouch && !isDragging ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: -SWIPE_WIDTH, right: 0 }}
        dragElastic={{ left: 0.04, right: 0 }}
        onDragEnd={(_, info) => setSwiped(info.offset.x < -SWIPE_WIDTH / 2)}
        animate={{ x: swiped ? -SWIPE_WIDTH : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        onClick={() => swiped && setSwiped(false)}
        style={{ background }}
        // `group` is what the comment icon hovers against; without it the icon
        // never appears on a task that has no comments yet.
        className="group relative flex flex-col gap-1.5 px-1.5 py-2 transition-colors duration-300
          sm:flex-row sm:items-center sm:gap-2.5"
      >
        <div className="flex w-full items-center gap-2.5 sm:w-auto sm:flex-1">
          <span
            {...drag.handleProps(task.id)}
            aria-hidden
            className="shrink-0 cursor-grab touch-none text-[15px] text-[#C9B48C] select-none
              active:cursor-grabbing"
          >
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
              'min-w-0 flex-1 cursor-pointer text-[15px] leading-snug font-semibold sm:min-w-[160px]',
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
        </div>

        {/* `sm:contents` dissolves this wrapper on desktop, so the single-line
            layout stays exactly what it was before mobile existed. */}
        <div className="flex w-full items-center gap-2 pl-[26px] sm:contents sm:w-auto sm:pl-0">
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
              `w-[118px] rounded-lg border-[1.5px] border-input bg-background px-1.5 text-xs
              font-bold outline-none`,
              CONTROL_HEIGHT,
              overdue ? 'text-destructive' : 'text-[#8A785C]',
            )}
          />

          {/* Which affordance appears follows the pointer, not the width: a narrow
              desktop window keeps the ✕, since it can never swipe. */}
          {isTouch ? null : (
            <button
              type="button"
              aria-label="Taak verwijderen"
              onClick={() => deleteTask(task.id)}
              className="flex size-4 shrink-0 cursor-pointer items-center justify-center
                text-[13px] leading-none text-[#C9B48C] transition-colors hover:text-destructive"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
