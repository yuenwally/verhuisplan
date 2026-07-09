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

function QuestionRow({ question }: { question: Question }) {
  const toggleQuestion = useToggleQuestion();
  const deleteQuestion = useDeleteQuestion();
  const { flashes, flash } = useFlash();
  const checkboxId = useId();

  const flashColor = flashes[question.id];

  return (
    <motion.div
      layout="position"
      {...listItemMotion()}
      style={flashColor ? { background: tint(flashColor) } : undefined}
      className="flex items-start gap-2.5 overflow-hidden rounded-md transition-colors duration-300"
    >
      <Checkbox
        id={checkboxId}
        checked={question.done}
        onCheckedChange={() => {
          toggleQuestion(question.id);
          flash(question.id);
        }}
        className="mt-px size-5 min-w-5 rounded-md"
        iconClassName="text-[11px]"
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
        className="cursor-pointer px-0.5 text-sm text-[#C9B48C] transition-colors
          hover:text-destructive"
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
        className="mt-3"
        placeholder="+ vraag toevoegen…"
        inputClassName="rounded-[9px] px-2.75 py-2 text-[13px]"
        onSubmit={addQuestion}
      />
    </section>
  );
}
