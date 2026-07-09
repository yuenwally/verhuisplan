'use client';

import { motion } from 'motion/react';
import { useId } from 'react';
import { useFlash } from '@/components/flash-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { WhoBadge } from '@/components/who-badge';
import { useTaskActions } from '@/hooks/use-task-actions';
import { formatDeadlineShort, isOverdue, tint } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { DragHandlers } from '@/hooks/use-drag-reorder';
import type { Task } from '@/lib/types';

const CARD_PADDING_Y = 10;

/** The board view's compact card. Same data, fewer controls than the list row. */
export function TaskCard({ task, drag }: { task: Task; drag: DragHandlers }) {
  const { onToggle, onCycleWho } = useTaskActions(task.id);
  const { flashes } = useFlash();
  const checkboxId = useId();

  const overdue = isOverdue(task.deadline, task.done);
  const flashColor = flashes[task.id];

  return (
    <motion.div
      layout="position"
      {...listItemMotion(CARD_PADDING_Y)}
      draggable
      onDragStart={() => drag.onDragStart(task.id)}
      onDragEnter={() => drag.onDragEnter(task.id)}
      onDragOver={(event) => event.preventDefault()}
      onDragEnd={drag.onDragEnd}
      style={flashColor ? { background: tint(flashColor) } : undefined}
      className="overflow-hidden rounded-[10px] border-[1.5px] border-border bg-card px-2.5
        shadow-[0_2px_6px_rgba(90,70,40,0.06)] transition-colors duration-300"
    >
      {/* Completed cards dim through a class, so the enter fade above stays free
          to animate opacity without the two fighting over the same inline style. */}
      <div className={cn('transition-opacity duration-300', task.done && 'opacity-55')}>
        <div className="flex items-start gap-2">
          <Checkbox
            id={checkboxId}
            checked={task.done}
            onCheckedChange={onToggle}
            className="size-[22px] min-w-[22px] rounded-[7px]"
            iconClassName="text-xs"
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
          <button
            type="button"
            onClick={onCycleWho}
            className="cursor-pointer rounded-full border-[1.5px] border-input bg-background px-2
              py-0.5 text-[11.5px] font-extrabold text-secondary-foreground"
          >
            <WhoBadge who={task.who} glyphClassName="size-[13px] text-[11px]" />
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
      </div>
    </motion.div>
  );
}
