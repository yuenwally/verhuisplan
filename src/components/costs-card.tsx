'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useId } from 'react';
import { AddInput } from '@/components/add-input';
import { useFlash } from '@/components/flash-provider';
import { Label } from '@/components/ui/label';
import { useAddCost, useCosts, useDeleteCost, useSetAmount } from '@/hooks/use-plan';
import { formatCostTotal, sanitizeAmount, tint } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';
import type { Cost } from '@/lib/types';

function CostRow({ cost }: { cost: Cost }) {
  const setAmount = useSetAmount();
  const deleteCost = useDeleteCost();
  const { flashes, flash } = useFlash();
  const amountId = useId();

  const flashColor = flashes[cost.id];

  return (
    <motion.div
      layout="position"
      {...listItemMotion()}
      style={flashColor ? { background: tint(flashColor) } : undefined}
      className="group flex items-center gap-2 overflow-hidden rounded-md transition-colors
        duration-300"
    >
      {/* The delete button sits before the label rather than after the field, so
          the field can run to the card's edge and line up with the add-input. */}
      <button
        type="button"
        aria-label={`${cost.label} verwijderen`}
        onClick={() => deleteCost(cost.id)}
        className="flex size-4 shrink-0 cursor-pointer items-center justify-center text-[13px]
          leading-none text-[#C9B48C] opacity-0 transition group-hover:opacity-100
          hover:text-destructive focus-visible:opacity-100"
      >
        ✕
      </button>
      <Label
        htmlFor={amountId}
        className="min-w-0 flex-[2] cursor-pointer truncate text-[13.5px] font-bold"
      >
        {cost.label}
      </Label>
      <div className="flex min-w-[104px] flex-1 items-center gap-1">
        <span className="text-[13px] font-extrabold text-[#8A785C]">€</span>
        <input
          id={amountId}
          value={cost.amount}
          placeholder="indicatie"
          inputMode="numeric"
          onChange={(event) => {
            setAmount(cost.id, sanitizeAmount(event.target.value));
            flash(cost.id);
          }}
          className="min-w-0 flex-1 rounded-[4px] border-[1.5px] border-input bg-background px-2
            py-1.5 text-right text-[13px] font-bold text-foreground outline-none"
        />
      </div>
    </motion.div>
  );
}

export function CostsCard() {
  const costs = useCosts();
  const addCost = useAddCost();

  const total = formatCostTotal(costs.map((cost) => cost.amount));

  return (
    <section className="rounded-[14px] border-2 border-border bg-card p-4.5">
      <div className="mb-2.5 flex items-baseline gap-2.5">
        <h2 className="flex-1 font-hand text-2xl font-bold">Kosten 💶</h2>
        <motion.span
          key={total}
          initial={{ opacity: 0.4, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-[15px] font-extrabold text-primary"
        >
          {total}
        </motion.span>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {costs.map((cost) => (
            <CostRow key={cost.id} cost={cost} />
          ))}
        </AnimatePresence>
      </div>

      <AddInput
        className="mt-3"
        placeholder="+ kostenpost…"
        inputClassName="rounded-[4px] px-2.75 py-2 text-[13px]"
        onSubmit={addCost}
      />
    </section>
  );
}
