'use client';

import { AnimatePresence, motion } from 'motion/react';
import { AddInput } from '@/components/add-input';
import { useFlash } from '@/components/flash-provider';
import { useAddCost, useCosts, useDeleteCost, useSetAmount } from '@/hooks/use-plan';
import { formatCostTotal, sanitizeAmount, tint } from '@/lib/format';

export function CostsCard() {
  const costs = useCosts();
  const addCost = useAddCost();
  const setAmount = useSetAmount();
  const deleteCost = useDeleteCost();
  const { flashes, flash } = useFlash();

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
          {costs.map((cost) => {
            const flashColor = flashes[cost.id];

            return (
              <motion.div
                key={cost.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={flashColor ? { background: tint(flashColor) } : undefined}
                className="group flex items-center gap-2 overflow-hidden rounded-md
                  transition-colors duration-300"
              >
                <div className="flex-1 text-[13.5px] font-bold">{cost.label}</div>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-extrabold text-[#8A785C]">€</span>
                  <input
                    value={cost.amount}
                    placeholder="indicatie"
                    inputMode="numeric"
                    aria-label={`Bedrag voor ${cost.label}`}
                    onChange={(event) => {
                      setAmount(cost.id, sanitizeAmount(event.target.value));
                      flash(cost.id);
                    }}
                    className="w-21 rounded-lg border-[1.5px] border-input bg-background px-2 py-1.5
                      text-right text-[13px] font-bold text-foreground outline-none"
                  />
                </div>
                <button
                  type="button"
                  aria-label={`${cost.label} verwijderen`}
                  onClick={() => deleteCost(cost.id)}
                  className="cursor-pointer px-0.5 text-sm text-[#C9B48C] opacity-0 transition
                    group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
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
        placeholder="+ kostenpost…"
        inputClassName="rounded-[9px] px-2.75 py-2 text-[13px]"
        onSubmit={addCost}
      />
    </section>
  );
}
