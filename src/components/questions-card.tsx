'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useId } from 'react';
import { AddInput } from '@/components/add-input';
import { useFlash } from '@/components/flash-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAddQuestion, useDeleteQuestion, useQuestions, useToggleQuestion } from '@/hooks/use-plan';
import { tint } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/types';

/**
 * The row clips its overflow so it can collapse on exit, and it is rounded to
 * carry the edit-flash tint. Children therefore have to sit inside those rounded
 * corners, or the corners bite into them. `ROW_INSET` keeps the add-input below
 * lined up with them.
 */
const ROW_PADDING_Y = 3;
const ROW_INSET = 'px-1.5';

function QuestionRow({ question }: { question: Question }) {
  const toggleQuestion = useToggleQuestion();
  const deleteQuestion = useDeleteQuestion();
  const { flashes, flash } = useFlash();
  const checkboxId = useId();

  const flashColor = flashes[question.id];

  return (
    <motion.div
      layout="position"
      {...listItemMotion(ROW_PADDING_Y)}
      style={flashColor ? { background: tint(flashColor) } : undefined}
      className={cn(
        'flex items-start gap-2.5 overflow-hidden rounded-md transition-colors duration-300',
        ROW_INSET,
      )}
    >
      <Checkbox
        id={checkboxId}
        checked={question.done}
        onCheckedChange={() => {
          toggleQuestion(question.id);
          flash(question.id);
        }}
        className="mt-0.5 size-4 min-w-4 rounded-[5px]"
        iconClassName="text-[10px]"
      />
      <Label
        htmlFor={checkboxId}
        className={cn(
          'flex-1 cursor-pointer text-[13.5px] leading-snug font-semibold',
          question.done && 'text-ink-faint line-through',
        )}
      >
        {question.text}
      </Label>
      <button
        type="button"
        aria-label="Vraag verwijderen"
        onClick={() => deleteQuestion(question.id)}
        className="mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center
          text-[13px] leading-none text-[#C9B48C] transition-colors hover:text-destructive"
      >
        ✕
      </button>
    </motion.div>
  );
}

export function QuestionsCard() {
  const questions = useQuestions();
  const addQuestion = useAddQuestion();

  return (
    <section className="rounded-[14px] border-2 border-border bg-card p-4.5">
      <h2 className="mb-2.5 font-hand text-2xl font-bold">Open vragen ❓</h2>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {questions.map((question) => (
            <QuestionRow key={question.id} question={question} />
          ))}
        </AnimatePresence>
      </div>

      <AddInput
        className={cn('mt-3', ROW_INSET)}
        placeholder="+ vraag toevoegen…"
        inputClassName="rounded-[9px] px-2.75 py-2 text-[13px]"
        onSubmit={addQuestion}
      />
    </section>
  );
}
