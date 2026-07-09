'use client';

import { AnimatePresence, motion } from 'motion/react';
import { AddInput } from '@/components/add-input';
import { useFlash } from '@/components/flash-provider';
import { Checkbox } from '@/components/ui/checkbox';
import { useAddQuestion, useDeleteQuestion, useQuestions, useToggleQuestion } from '@/hooks/use-plan';
import { tint } from '@/lib/format';
import { cn } from '@/lib/utils';

export function QuestionsCard() {
  const questions = useQuestions();
  const addQuestion = useAddQuestion();
  const toggleQuestion = useToggleQuestion();
  const deleteQuestion = useDeleteQuestion();
  const { flashes, flash } = useFlash();

  return (
    <section className="rounded-[14px] border-2 border-border bg-card p-4.5">
      <h2 className="mb-2.5 font-hand text-2xl font-bold">Open vragen ❓</h2>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {questions.map((question) => {
            const flashColor = flashes[question.id];

            return (
              <motion.div
                key={question.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={flashColor ? { background: tint(flashColor) } : undefined}
                className="flex items-start gap-2.5 overflow-hidden rounded-md transition-colors
                  duration-300"
              >
                <Checkbox
                  checked={question.done}
                  onCheckedChange={() => {
                    toggleQuestion(question.id);
                    flash(question.id);
                  }}
                  aria-label={question.done ? 'Vraag heropenen' : 'Vraag beantwoord'}
                  className="mt-px size-5 min-w-5 rounded-md"
                  iconClassName="text-[11px]"
                />
                <div
                  className={cn(
                    'flex-1 text-[13.5px] font-semibold',
                    question.done && 'text-ink-faint line-through',
                  )}
                >
                  {question.text}
                </div>
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
          })}
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
