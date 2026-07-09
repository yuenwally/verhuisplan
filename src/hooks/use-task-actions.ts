'use client';

import { useConfetti } from '@/components/confetti-provider';
import { useFlash } from '@/components/flash-provider';
import { useCycleWho, useToggleTask } from '@/hooks/use-plan';

/**
 * The two actions a task offers in both views, with the multiplayer side effects
 * attached: everyone else sees the row flash, and finishing a phase throws confetti.
 */
export function useTaskActions(taskId: string) {
  const toggle = useToggleTask();
  const cycle = useCycleWho();
  const { flash } = useFlash();
  const { celebrate } = useConfetti();

  return {
    onToggle: () => {
      const phaseComplete = toggle(taskId);
      flash(taskId);

      if (phaseComplete) {
        celebrate();
      }
    },
    onCycleWho: () => {
      cycle(taskId);
      flash(taskId);
    },
  };
}
