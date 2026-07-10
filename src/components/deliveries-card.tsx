'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useId } from 'react';
import { AddInput } from '@/components/add-input';
import { useFlash } from '@/components/flash-provider';
import { Label } from '@/components/ui/label';
import { useAddDelivery, useDeleteDelivery, useDeliveries, useSetDeliveryDate } from '@/hooks/use-plan';
import { tint } from '@/lib/format';
import { listItemMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { Delivery } from '@/lib/types';

/** Same reasoning as the other cards: children sit inside the rounded, clipped row. */
const ROW_PADDING_Y = 4;
const ROW_INSET = 'px-1.5';

function DeliveryRow({ delivery }: { delivery: Delivery }) {
  const setDate = useSetDeliveryDate();
  const deleteDelivery = useDeleteDelivery();
  const { flashes, flash } = useFlash();
  const startId = useId();

  const flashColor = flashes[delivery.id];
  const incomplete = !delivery.start || !delivery.end;
  const inverted = delivery.start && delivery.end && delivery.end < delivery.start;

  const dateClass = `min-w-0 flex-1 rounded-[4px] border-[1.5px] border-input bg-background px-1.5
    py-1 text-[11.5px] font-bold text-[#8A785C] outline-none`;

  return (
    <motion.div
      layout="position"
      {...listItemMotion(ROW_PADDING_Y)}
      style={flashColor ? { background: tint(flashColor) } : undefined}
      className={cn(
        'group overflow-hidden rounded-md transition-colors duration-300',
        ROW_INSET,
      )}
    >
      <div className="flex items-center gap-2">
        <Label htmlFor={startId} className="min-w-0 flex-1 cursor-pointer text-[13.5px] font-bold">
          {delivery.label}
        </Label>
        <button
          type="button"
          aria-label={`${delivery.label} verwijderen`}
          onClick={() => deleteDelivery(delivery.id)}
          className="flex size-4 shrink-0 cursor-pointer items-center justify-center text-[13px]
            leading-none text-[#C9B48C] opacity-0 transition group-hover:opacity-100
            hover:text-destructive focus-visible:opacity-100"
        >
          ✕
        </button>
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <input
          id={startId}
          type="date"
          value={delivery.start}
          aria-label={`Startdatum ${delivery.label}`}
          onChange={(event) => {
            setDate(delivery.id, 'start', event.target.value);
            flash(delivery.id);
          }}
          className={dateClass}
        />
        <span className="text-[11px] font-bold text-ink-faint">t/m</span>
        <input
          type="date"
          value={delivery.end}
          aria-label={`Einddatum ${delivery.label}`}
          onChange={(event) => {
            setDate(delivery.id, 'end', event.target.value);
            flash(delivery.id);
          }}
          className={cn(dateClass, inverted && 'border-destructive text-destructive')}
        />
      </div>

      {incomplete ? (
        <p className="mt-0.5 text-[11px] font-bold text-ink-faint">Nog niet ingepland.</p>
      ) : null}
      {inverted ? (
        <p className="mt-0.5 text-[11px] font-bold text-destructive">
          De einddatum ligt vóór de startdatum.
        </p>
      ) : null}
    </motion.div>
  );
}

export function DeliveriesCard() {
  const deliveries = useDeliveries();
  const addDelivery = useAddDelivery();

  return (
    <section className="rounded-[14px] border-2 border-border bg-card p-4.5">
      <h2 className="mb-2.5 font-hand text-2xl font-bold">Leveringen 🚚</h2>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {(deliveries ?? []).map((delivery) => (
            <DeliveryRow key={delivery.id} delivery={delivery} />
          ))}
        </AnimatePresence>
      </div>

      {deliveries?.length === 0 ? (
        <p className="text-[13px] font-semibold text-ink-faint">
          Nog geen leveringen. Voeg er een toe.
        </p>
      ) : null}

      <AddInput
        className={cn('mt-3', ROW_INSET)}
        placeholder="+ levering…"
        inputClassName="rounded-[4px] px-2.75 py-2 text-[13px]"
        onSubmit={addDelivery}
      />
    </section>
  );
}
