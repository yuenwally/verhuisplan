'use client';

import { MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { AvatarGlyph } from '@/components/avatar-glyph';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsTouch } from '@/hooks/use-is-touch';
import { useAddComment, useDeleteComment, useTaskComments } from '@/hooks/use-plan';
import { timeAgo } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { KeyboardEvent } from 'react';

/**
 * The icon is only visible once a task has a comment, as asked. With none it
 * still has to be reachable: a mouse reveals it by hovering the row, and touch,
 * which cannot hover, always sees it. Otherwise a first comment could never be
 * written on a phone.
 */
export function TaskComments({
  taskId,
  count,
  className,
}: {
  taskId: string;
  count: number;
  className?: string;
}) {
  const comments = useTaskComments(taskId);
  const isTouch = useIsTouch();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [draft, setDraft] = useState('');

  const submit = () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      return;
    }

    addComment(taskId, trimmed);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const hasComments = count > 0;
  const label = hasComments
    ? `${count} ${count === 1 ? 'opmerking' : 'opmerkingen'}`
    : 'Opmerking toevoegen';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          className={cn(
            `flex shrink-0 cursor-pointer items-center gap-0.5 rounded-md px-1 text-[#C9B48C]
            transition hover:text-primary focus-visible:opacity-100`,
            hasComments || isTouch
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
            hasComments && 'text-primary',
            className,
          )}
        >
          <MessageSquare className="size-3.5" aria-hidden />
          {hasComments ? (
            <span className="text-[10.5px] leading-none font-extrabold">{count}</span>
          ) : null}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-3">
        <div className="mb-2 text-[12.5px] font-extrabold text-secondary-foreground">
          Opmerkingen
        </div>

        {comments.length === 0 ? (
          <p className="mb-2 text-[13px] font-semibold text-ink-faint">
            Nog geen opmerkingen bij deze taak.
          </p>
        ) : (
          <div className="mb-2 flex max-h-56 flex-col gap-2 overflow-y-auto">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  layout="position"
                  {...listItemMotion(2)}
                  className="group/comment flex items-start gap-2 overflow-hidden"
                >
                  <AvatarGlyph
                    avatar={comment.avatar}
                    className="mt-0.5 size-[16px] text-[14px]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] leading-snug font-semibold break-words">
                      {comment.text}
                    </div>
                    <div className="text-[11px] font-bold text-ink-faint">
                      {comment.author} · {timeAgo(comment.ts)}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Opmerking verwijderen"
                    onClick={() => deleteComment(comment.id)}
                    className="flex size-4 shrink-0 cursor-pointer items-center justify-center
                      text-[13px] leading-none text-[#C9B48C] opacity-0 transition
                      group-hover/comment:opacity-100 hover:text-destructive
                      focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <textarea
          value={draft}
          rows={2}
          placeholder="Schrijf een opmerking…"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          className="w-full resize-none rounded-[4px] border-2 border-dashed border-[#D8C6A0]
            bg-transparent px-2 py-1.5 text-[13px] font-semibold text-foreground outline-none
            focus:border-primary/60"
        />
        <div className="mt-1 text-[11px] font-bold text-ink-faint">
          Enter om te plaatsen, Shift+Enter voor een nieuwe regel.
        </div>
      </PopoverContent>
    </Popover>
  );
}
